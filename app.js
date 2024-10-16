const express = require("express");
require("dotenv").config();
const bodyParser = require("body-parser");
const axios = require("axios");
const { getOAuthToken, getTwitchUserId } = require("./methods");

const app = express();
const PORT = process.env.PORT || 3000;

// ENV Variables
const { TWITCH_CLIENT_ID, TWITCH_EVENTSUB_URL, TWITCH_CALLBACK_URL, TWITCH_SECRET } = process.env;

// Middleware
app.use(bodyParser.json());

// ADD USER TO EVENTSUB STREAM ONLINE
app.post("/subscribe-to-live/:username", async (req, res) => {
  const username = req.params.username;
  const userId = await getTwitchUserId(username);

  if (!userId) {
    return res.status(400).json({ error: "L'ID de la chaîne Twitch est requis." });
  }

  try {
    const accessToken = await getOAuthToken();

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

    res.status(200).json({ message: "Abonnement à EventSub réussi", data: response.data });
  } catch (error) {
    console.error("Erreur lors de l'inscription à EventSub:", error.response?.data || error.message);
    res.status(500).json({ error: "Erreur lors de l'inscription à EventSub" });
  }
});

// DELETE USER TO EVENTSUB STREAM ONLINE
app.delete("/unsubscribe/:username", async (req, res) => {
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

// VERFIY CALLBACK
app.post("/webhooks/callback", async (req, res) => {
  const messageType = req.headers["twitch-eventsub-message-type"];

  // Vérification du challenge
  if (messageType === "webhook_callback_verification") {
    return res.status(200).send(req.body.challenge);
  }

  // Si ce n'est pas un challenge, on vérifie l'état de l'abonnement
  try {
    const accessToken = await getOAuthToken();
    const clientId = TWITCH_CLIENT_ID; // Ton client ID Twitch

    const response = await axios.get("https://api.twitch.tv/helix/eventsub/subscriptions", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Client-ID": clientId,
      },
    });

    const subscriptions = response.data.data;

    // Chercher si l'abonnement est "enabled"
    subscriptions.forEach((subscription) => {
      if (subscription.status === "enabled") {
        console.log("L'abonnement est actif !"); // Ceci s'affichera dans la console
        // Tu peux également envoyer un message dans le chat ou gérer d'autres actions ici.
      }
    });

    res.sendStatus(200);
  } catch (error) {
    console.error("Erreur lors de la vérification de l'abonnement :", error);
    res.sendStatus(500);
  }
});

app.listen(PORT, () => {
  console.log("La broche tourne sur https://localhost:3000");
});
