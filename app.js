const express = require("express");
require("dotenv").config();
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

// ENV Variables
const { TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET, TWITCH_EVENTSUB_URL, TWITCH_CALLBACK_URL, TWITCH_SECRET } = process.env;

// Middleware
app.use(bodyParser.json());

// AUTHENTICATION TO TWITCH APP
async function getOAuthToken() {
  const response = await axios.post("https://id.twitch.tv/oauth2/token", null, {
    params: {
      client_id: TWITCH_CLIENT_ID,
      client_secret: TWITCH_CLIENT_SECRET,
      grant_type: "client_credentials",
    },
  });
  return response.data.access_token;
}

// GET USER ID BY USERNAME
async function getTwitchUserId(username) {
  try {
    const accessToken = await getOAuthToken();

    const response = await axios.get(`https://api.twitch.tv/helix/users?login=${username}`, {
      headers: {
        "Client-ID": TWITCH_CLIENT_ID,
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.data.data.length > 0) {
      const userId = response.data.data[0].id;
      console.log(`L'ID de l'utilisateur Twitch ${username} est : ${userId}`);
      return userId;
    } else {
      console.error(`Utilisateur Twitch ${username} non trouvé.`);
      return null;
    }
  } catch (error) {
    console.error("Erreur lors de la récupération de l'ID utilisateur:", error.response?.data || error.message);
  }
}

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
    } else {
      console.log(`${username} trouvé pour suppréssion`);
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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
