// ========= IMPORTS ========= //
// npm
const axios = require("axios");
require("dotenv").config();

// ========= CONFIG ========= //
const { TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET } = process.env;

// ========= METHODS ========= //
const twitchMethods = {
  // ---------------------------------------------------------------------------------------------------------------------------------- //
  // AUTHENTICATION TO TWITCH APP
  getOAuthToken: async () => {
    const response = await axios.post("https://id.twitch.tv/oauth2/token", null, {
      params: {
        client_id: TWITCH_CLIENT_ID,
        client_secret: TWITCH_CLIENT_SECRET,
        grant_type: "client_credentials",
      },
    });
    return response.data.access_token;
  },

  // ---------------------------------------------------------------------------------------------------------------------------------- //
  // GET USER ID BY USERNAME
  getTwitchUserId: async (username) => {
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
        return userId;
      } else {
        console.error(`Utilisateur Twitch ${username} non trouvé.`);
        return null;
      }
    } catch (error) {
      console.error("Erreur lors de la récupération de l'ID utilisateur:", error.response?.data || error.message);
    }
  },

  // ---------------------------------------------------------------------------------------------------------------------------------- //
  // GET USER DATA BY ID
  getUserInfo: async (userId) => {
    const accessToken = await getOAuthToken();
    try {
      const response = await axios.get("https://api.twitch.tv/helix/users", {
        params: {
          id: userId,
        },
        headers: {
          "Client-ID": TWITCH_CLIENT_ID,
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return response.data.data[0];
    } catch (error) {
      console.error("Erreur lors de la récupération des informations utilisateur:", error);
    }
  },

  // ---------------------------------------------------------------------------------------------------------------------------------- //
  // GET STREAM DATA BY USER ID
  getStreamInfo: async (userId) => {
    const accessToken = await getOAuthToken();
    try {
      const response = await axios.get(`https://api.twitch.tv/helix/streams?user_id=${userId}`, {
        headers: {
          "Client-ID": TWITCH_CLIENT_ID,
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return response.data.data[0];
    } catch (error) {
      console.error("Erreur lors de la récupération des informations du stream:", error);
    }
  },

  // ---------------------------------------------------------------------------------------------------------------------------------- //
  // GET CATEGORY DATA BY GAME ID
  getCategorieInfo: async (gameId) => {
    const accessToken = await getOAuthToken();
    try {
      const response = await axios.get(`https://api.twitch.tv/helix/games?id=${gameId}`, {
        headers: {
          "Client-ID": TWITCH_CLIENT_ID,
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return response.data.data[0];
    } catch (error) {
      console.error("Erreur lors de la récupération des informations de la catégorie:", error);
    }
  },
};

const { getOAuthToken } = twitchMethods;

module.exports = twitchMethods;
