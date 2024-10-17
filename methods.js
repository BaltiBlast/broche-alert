const axios = require("axios");
require("dotenv").config();

const { TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET } = process.env;

const methods = {
  // ---------------------------------------------------------------------- //
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

  // ---------------------------------------------------------------------- //
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

  // ---------------------------------------------------------------------- //
  // GET USER DATA BY ID
  getUserInfo: async (userId) => {
    try {
      const accessToken = await getOAuthToken();
      const response = await axios.get("https://api.twitch.tv/helix/users", {
        params: {
          id: userId,
        },
        headers: {
          "Client-ID": TWITCH_CLIENT_ID,
          Authorization: `Bearer ${accessToken}`,
        },
      });

      console.log(response.data.data[0]);
      return response.data.data[0];
    } catch (error) {
      console.error("Erreur lors de la récupération des informations utilisateur:", error);
    }
  },
};

const { getOAuthToken } = methods;

module.exports = methods;
