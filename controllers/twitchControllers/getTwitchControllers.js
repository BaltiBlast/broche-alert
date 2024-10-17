// ### IMPORTS ### //
// npm
const axios = require("axios");
require("dotenv").config();

// local
const { getOAuthToken } = require("../../methods/twitchMethods.js");

const getTwitchControllers = {
  getCheckSubscriptions: async (req, res) => {
    // ---------------------------------------------------------------------------------------------------------------------------------- //
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
  },
};

module.exports = getTwitchControllers;
