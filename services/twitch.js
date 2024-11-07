// -------------------------------------------------------------------------------------------------------------------- //
// ===== IMPORTS ===== //
// npm
const axios = require("axios");
require("dotenv").config();

// ===== CONFIG ===== //
const { TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET } = process.env;

async function getOAuthTokenTwitch() {
  try {
    // 1. Get OAuth token from Twitch
    const response = await axios.post("https://id.twitch.tv/oauth2/token", null, {
      params: {
        client_id: TWITCH_CLIENT_ID,
        client_secret: TWITCH_CLIENT_SECRET,
        grant_type: "client_credentials",
      },
    });

    const { access_token } = response.data;
    return { "Client-ID": TWITCH_CLIENT_ID, Authorization: `Bearer ${access_token}` };
  } catch (error) {
    console.error("[ERROR GET OAUTH TOKEN TWITCH] services/twitch.js :", error);
  }
}

module.exports = {
  getOAuthTokenTwitch,
};
