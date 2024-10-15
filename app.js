const express = require("express");
require("dotenv").config();
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

// ENV Variables
const { TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET } = process.env;

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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
