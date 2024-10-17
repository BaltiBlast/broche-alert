// ### IMPORTS ### //
// npm
const router = require("express").Router();
const axios = require("axios");
require("dotenv").config();

// local
const { getOAuthToken, getTwitchUserId, getUserInfo } = require("./methods");

// config
const { TWITCH_CLIENT_ID, TWITCH_EVENTSUB_URL, TWITCH_CALLBACK_URL, TWITCH_SECRET, DISCORD_WEBHOOK } = process.env;

// ### ROUTES ### //
// ----------------------------------------------------------------- //
// -- GET
router.get("/check-subscriptions", async (req, res) => {
  const accessToken = await getOAuthToken();
  axios
    .get("https://api.twitch.tv/helix/eventsub/subscriptions", {
      headers: {
        "Client-ID": TWITCH_CLIENT_ID,
        Authorization: `Bearer ${accessToken}`,
      },
    })
    .then((response) => {
      console.log(response.data);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
});

// ----------------------------------------------------------------- //
// -- POST
router.post("/subscribe-to-live/:username", async (req, res) => {
  try {
    const username = req.params.username;
    const userId = await getTwitchUserId(username);
    const accessToken = await getOAuthToken();

    if (!userId) {
      return res.status(400).json({ error: "L'ID de la chaîne Twitch est requis." });
    }

    const response = await axios.post(
      TWITCH_EVENTSUB_URL,
      {
        type: "stream.online",
        version: "1",
        condition: {
          broadcaster_user_id: userId,
        },
        transport: {
          method: "webhook",
          callback: TWITCH_CALLBACK_URL,
          secret: TWITCH_SECRET,
        },
      },
      {
        headers: {
          "Client-ID": TWITCH_CLIENT_ID,
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.status(202).json({ message: "Abonnement à EventSub réussi", data: response.data });
  } catch (error) {
    console.error("Erreur lors de l'inscription à EventSub:", error.response?.data || error.message);
    res.status(500).json({ error: "Erreur lors de l'inscription à EventSub" });
  }
});

router.post("/webhooks/callback", async (req, res) => {
  const messageType = req.headers["twitch-eventsub-message-type"];

  // Vérification du webhook Twitch
  if (messageType === "webhook_callback_verification") {
    return res.status(200).send(req.body.challenge);
  }

  // Si une personne lance un live
  if (messageType === "notification" && req.body.subscription.type === "stream.online") {
    const streamerId = req.body.event.broadcaster_user_id;
    const streamerName = req.body.event.broadcaster_user_name;

    // Récupérer les informations de l'utilisateur
    const user = await getUserInfo(streamerId);

    // Si l'utilisateur est trouvé
    if (user) {
      const accessToken = await getOAuthToken(); // Obtenez le token OAuth ici

      // Récupérer les informations du stream
      const streamResponse = await axios.get(`https://api.twitch.tv/helix/streams?user_id=${streamerId}`, {
        headers: {
          "Client-ID": TWITCH_CLIENT_ID,
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Extraire les informations de stream
      const streamData = streamResponse.data.data[0];
      console.log("STREAM DATA", streamData);

      const { title, game_id, thumbnail_url } = streamData;

      // Récupérer les informations de la catégorie
      let categoryImage = "";
      let categoryName = "";
      if (game_id) {
        const categoryResponse = await axios.get(`https://api.twitch.tv/helix/games?id=${game_id}`, {
          headers: {
            "Client-ID": TWITCH_CLIENT_ID,
            Authorization: `Bearer ${accessToken}`,
          },
        });
        const categoryData = categoryResponse.data.data[0];
        categoryImage = categoryData.box_art_url.replace("{width}", "300").replace("{height}", "400") || ""; // Remplacer par une taille d'image plus grande
        categoryName = categoryData.name || "Inconnu"; // Nom de la catégorie
      }

      // Envoi d'un message via le webhook Discord
      const embed = {
        title: title,
        description: `**${streamerName}** est est en live !`,
        author: {
          name: streamerName,
          icon_url: user.profile_image_url,
        },
        fields: [
          {
            name: "Category",
            value: categoryName,
            inline: true,
          },
          {
            name: "Stream",
            value: `https://twitch.tv/${streamerName}`,
            inline: true,
          },
        ],
        image: {
          url: thumbnail_url,
        },
        footer: {
          text: "In kebab we trust - Made by Balti",
        },
      };

      try {
        await axios.post(DISCORD_WEBHOOK, { embeds: [embed] });
        console.log("Message envoyé sur Discord");
      } catch (error) {
        console.error("Erreur lors de l'envoi du message Discord:", error);
      }
    } else {
      console.error("Utilisateur non trouvé.");
    }
  }

  res.sendStatus(200);
});

// ----------------------------------------------------------------- //
// -- DELETE
router.delete("/unsubscribe/:username", async (req, res) => {
  const username = req.params.username;

  try {
    const userId = await getTwitchUserId(username);

    if (!userId) {
      return res.status(404).json({ error: "Utilisateur non trouvé." });
    }

    const accessToken = await getOAuthToken();

    // Lister les abonnements
    const response = await axios.get(TWITCH_EVENTSUB_URL, {
      headers: {
        "Client-ID": TWITCH_CLIENT_ID,
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const subscriptions = response.data.data;

    // Trouver l'abonnement correspondant à l'utilisateur
    const subscriptionToDelete = subscriptions.find((sub) => sub.condition.broadcaster_user_id === userId);

    if (!subscriptionToDelete) {
      return res.status(404).json({ error: `Aucun abonnement trouvé pour l'utilisateur ${username}.` });
    }

    const subscriptionId = subscriptionToDelete.id;

    // Supprimer l'abonnement
    await axios.delete(`${TWITCH_EVENTSUB_URL}?id=${subscriptionId}`, {
      headers: {
        "Client-ID": TWITCH_CLIENT_ID,
        Authorization: `Bearer ${accessToken}`,
      },
    });
    res.status(200).json({ message: `Abonnement supprimé pour l'utilisateur ${username}.` });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'abonnement :", error.response?.data || error.message);
    res.status(500).json({ error: "Erreur lors de la suppression de l'abonnement." });
  }
});

module.exports = router;
