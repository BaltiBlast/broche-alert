// ### IMPORTS ### //
// npm
const router = require("express").Router();
const axios = require("axios");
require("dotenv").config();

// local
const { getOAuthToken, getTwitchUserId, getUserInfo, getStreamInfo, getCategorieInfo } = require("./methods");

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
    const userId = req.body.event.broadcaster_user_id;

    const userData = await getUserInfo(userId);
    console.log("USER INFO RECU ✅ :", userData);

    const streamData = await getStreamInfo(userId);
    console.log("STREAM INFO RECU ✅ :", streamData);

    const categorieData = await getCategorieInfo(streamData.game_id);
    console.log("CATEGORIE INFO RECU ✅ :", categorieData);
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
