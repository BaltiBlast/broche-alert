const express = require("express");
require("dotenv").config();
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

// ENV Variables
const { TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET, TWITCH_EVENTSUB_URL, TWITCH_CALLBACK_URL } = process.env;

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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
