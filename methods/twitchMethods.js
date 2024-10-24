// ========= IMPORTS ========= //
// npm
const axios = require("axios");
require("dotenv").config();

// local
const { registerLiveAlertsSubscriptionInAirtable } = require("../methods/dbMethods.js");

// ========= CONFIG ========= //
const {
  TWITCH_CLIENT_ID,
  TWITCH_CLIENT_SECRET,
  TWITCH_EVENTSUB_URL,
  TWITCH_CALLBACK_URL,
  TWITCH_SECRET,
  DISCORD_WEBHOOK,
} = process.env;

// ========= METHODS ========= //
const twitchMethods = {
  // ---------------------------------------------------------------------------------------------------------------------------------- //
  // AUTHENTICATION TO TWITCH APP
  getOAuthToken: async () => {
    try {
      const response = await axios.post("https://id.twitch.tv/oauth2/token", null, {
        params: {
          client_id: TWITCH_CLIENT_ID,
          client_secret: TWITCH_CLIENT_SECRET,
          grant_type: "client_credentials",
        },
      });
      return response.data.access_token;
    } catch (error) {
      console.error("Erreur lors de la récupération du token OAuth :", error.response?.data || error.message);
    }
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

      return response.data.data[0];
    } catch (error) {
      console.error("Erreur lors de la récupération des informations utilisateur:", error);
    }
  },

  // ---------------------------------------------------------------------------------------------------------------------------------- //
  // GET STREAM DATA BY USER ID
  getStreamInfo: async (userId) => {
    try {
      const accessToken = await getOAuthToken();
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
    try {
      const accessToken = await getOAuthToken();
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

  // ---------------------------------------------------------------------------------------------------------------------------------- //
  // GET SUBSCRIPTION TO DELETE
  getSubscriptionToDelete: async (username) => {
    const accessToken = await getOAuthToken();
    const userId = await getTwitchUserId(username);

    const response = await axios.get(TWITCH_EVENTSUB_URL, {
      headers: {
        "Client-ID": TWITCH_CLIENT_ID,
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const subscriptions = response.data.data;
    const subscriptionToDelete = subscriptions.find((sub) => sub.condition.broadcaster_user_id === userId);

    return subscriptionToDelete;
  },

  // ---------------------------------------------------------------------------------------------------------------------------------- //
  // DELETE SUBSCRIPTION BY ID
  deleteSubscription: async (subscriptionId) => {
    const accessToken = await getOAuthToken();
    await axios.delete(`${TWITCH_EVENTSUB_URL}?id=${subscriptionId}`, {
      headers: {
        "Client-ID": TWITCH_CLIENT_ID,
        Authorization: `Bearer ${accessToken}`,
      },
    });
  },

  // ---------------------------------------------------------------------------------------------------------------------------------- //
  // GET ALL SUBSCRIPTIONS
  getAllSubscriptions: async () => {
    let usersSubscription = [];
    const accessToken = await getOAuthToken();

    const response = await axios.get("https://api.twitch.tv/helix/eventsub/subscriptions", {
      headers: {
        "Client-ID": TWITCH_CLIENT_ID,
        Authorization: `Bearer ${accessToken}`,
      },
    });

    usersSubscription = await Promise.all(
      response.data.data.map(async (element) => {
        const user = await getUserInfo(element.condition.broadcaster_user_id);
        return {
          subscriptionId: element.id,
          user: user.display_name,
          type: element.type,
          status: element.status,
          profilePicture: user.profile_image_url,
        };
      })
    );

    return usersSubscription;
  },

  // ---------------------------------------------------------------------------------------------------------------------------------- //
  // SUBSCRIBE TWITCH EVENT - STREAM ONLINE BY USERNAME
  subscriptionToStreamOnline: async (username, userId) => {
    const streamerId = await getTwitchUserId(username);
    const accessToken = await getOAuthToken();

    const response = await axios.post(
      TWITCH_EVENTSUB_URL,
      {
        type: "stream.online",
        version: "1",
        condition: {
          broadcaster_user_id: streamerId,
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

    if (response.data) {
      const objectSubscriptionInfo = {
        webhookId: response.data.data[0].id,
        streamerId: streamerId,
        streamCount: 0,
        webhookType: response.data.data[0].type,
        userId: userId,
      };

      await registerLiveAlertsSubscriptionInAirtable(objectSubscriptionInfo);
    }
  },

  // ---------------------------------------------------------------------------------------------------------------------------------- //
  // SEND NOTIFICATION TO DISCORD WHEN STREAM ONLINE WITH DISCORD WEBHOOK
  sendMessageToDiscord: async (userId) => {
    // user data
    const userData = await getUserInfo(userId);
    const { display_name, profile_image_url } = userData;

    // stream data
    const streamData = await getStreamInfo(userId);
    const { title } = streamData;

    // categorie data
    const categorieData = await getCategorieInfo(streamData.game_id);
    const { name, box_art_url } = categorieData;

    const urlCategoriePicture = box_art_url.replace("{width}", "285").replace("{height}", "380");

    const message = discordEmbedMessage(display_name, title, name, urlCategoriePicture, profile_image_url);

    await axios.post(DISCORD_WEBHOOK, { embeds: [message], content: "@everyone" });
  },

  // ---------------------------------------------------------------------------------------------------------------------------------- //
  // DISCORD EMBED MESSAGE TO SEND
  discordEmbedMessage: (display_name, title, name, urlCategoriePicture, profile_image_url) => {
    const discordEmbed = {
      title: `${display_name} est en live !`,
      description: title,
      color: null,
      fields: [
        {
          name: "",
          value: `[Regarder le stream](https://twitch.tv/${display_name})`,
        },
        {
          name: "",
          value: name,
          inline: true,
        },
      ],
      footer: {
        text: "In kebab we trust - Made by Balti",
      },
      image: {
        url: urlCategoriePicture,
      },
      thumbnail: {
        url: profile_image_url,
      },
      attachments: [],
    };

    return discordEmbed;
  },
};

const { getOAuthToken, getTwitchUserId, getUserInfo, getStreamInfo, getCategorieInfo, discordEmbedMessage } =
  twitchMethods;

module.exports = twitchMethods;
