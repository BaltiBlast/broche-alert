// -------------------------------------------------------------------------------------------------------------------- //
// ===== IMPORTS ===== //
// npm
const axios = require("axios");
require("dotenv").config();

const { NGROK_URL_CALLBACK, TWITCH_SECRET, TWITCH_EVENTSUB_URL } = process.env;

// local
const { getOAuthTokenTwitch } = require("../../../services/twitch.js");
const { db, TABLES } = require("../../../services/airtable.js");

const liveAlertMethods = {
  // -------------------------------------------------------------------------------------------------------------------- //
  // SUBSCRIBE TO TWITCH WEBHOOK (STREAM ONLINE)
  subscriptionToTwitchWebhook: async (streamerId) => {
    const twitchAcessToken = await getOAuthTokenTwitch();

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
          callback: NGROK_URL_CALLBACK,
          secret: TWITCH_SECRET,
        },
      },
      {
        headers: twitchAcessToken,
      }
    );

    return response.data;
  },

  // -------------------------------------------------------------------------------------------------------------------- //
  // GET TWITCH STREAMER DATA WITH STREAMER NAME
  getTwitchStreamerDataByName: async (streamerName) => {
    const twitchAcessToken = await getOAuthTokenTwitch();
    const response = await axios.get(`https://api.twitch.tv/helix/users?login=${streamerName}`, {
      headers: twitchAcessToken,
    });

    if (response.data.data.length > 0) {
      const twitchUserData = response.data.data[0];
      return twitchUserData;
    }

    return null;
  },

  // -------------------------------------------------------------------------------------------------------------------- //
  // DELETE TWITCH WEBHOOK SUBSCRIPTION
  deleteTwitchWebhookSubscription: async (subscriptionId) => {
    const twitchAcessToken = await getOAuthTokenTwitch();
    const response = await axios.delete(`${TWITCH_EVENTSUB_URL}?id=${subscriptionId}`, {
      headers: twitchAcessToken,
    });

    return response.data;
  },

  // -------------------------------------------------------------------------------------------------------------------- //
  // IS STREAMER ALREADY IN DATABASE
  isSubscriptionAlreadyExists: async (streamerId) => {
    // 1. Try to find the streamer in Airtable
    const records = await db(TABLES.subscriptions)
      .select({
        filterByFormula: `streamer_id = "${streamerId}"`,
      })
      .all();

    // 2. If the streamer is found, return true
    if (records.length > 0) {
      return true;
    } else {
      return false;
    }
  },

  // -------------------------------------------------------------------------------------------------------------------- //
  // ADD SUBSCRIPTION IN BDD
  addSubscription: async (subsciptionObject) => {
    const { subscriptionId, streamerId, userId, streamerName, streamerProfileImage } = subsciptionObject;
    // 1. Create the subscription in Airtable
    await db(TABLES.subscriptions).create([
      {
        fields: {
          subscription_id: subscriptionId,
          streamer_id: streamerId,
          user_id: userId,
          streamer_name: streamerName,
          streamer_profile_image: streamerProfileImage,
        },
      },
    ]);
  },

  // -------------------------------------------------------------------------------------------------------------------- //
  // GET THE OWN SUBSCRIPTION DATA WITH STREAMER ID
  getSubscriptionDataWithStreamerId: async (streamerId) => {
    const records = await db(TABLES.subscriptions)
      .select({
        filterByFormula: `streamer_id = "${streamerId}"`,
      })
      .all();

    if (records.length > 0) {
      return records[0].fields;
    }
  },

  // -------------------------------------------------------------------------------------------------------------------- //
  // IS USER ALREADY SUBSCRIBED TO STREAMER
  isUserAlreadySubscribed: async (userId, streamerId) => {
    // 1. Try to find the subscription in Airtable
    const records = await db(TABLES.subscriptions)
      .select({
        filterByFormula: `AND(user_id = "${userId}", streamer_id = "${streamerId}")`,
      })
      .all();

    // 2. If the subscription is found, return true
    if (records.length > 0) {
      return true;
    } else {
      return false;
    }
  },

  // -------------------------------------------------------------------------------------------------------------------- //
  // GET SUBSCRIPTION DATA BY USER ID
  getSubscriptionDataByUserId: async (userId) => {
    const records = await db(TABLES.subscriptions)
      .select({
        filterByFormula: `user_id = "${userId}"`,
      })
      .all();

    if (records.length > 0) {
      return records.map((record) => ({
        recordId: record.id,
        ...record.fields,
      }));
    }
  },

  // -------------------------------------------------------------------------------------------------------------------- //
  // DELETE SUBSCRIPTION IN BDD
  deleteSubscription: async (recordId) => {
    await db(TABLES.subscriptions).destroy([recordId]);
  },

  // -------------------------------------------------------------------------------------------------------------------- //
  // HOW MANY SUBSCRIPTION ID LEFT IN BDD
  isTheLastSubscriptionId: async (subscriptionId) => {
    // 1. Try to find the subscription in Airtable
    const records = await db(TABLES.subscriptions)
      .select({
        filterByFormula: `subscription_id = "${subscriptionId}"`,
      })
      .all();

    // 2. If the subscription is found, return true
    if (records) {
      return records.length;
    }
  },

  // -------------------------------------------------------------------------------------------------------------------- //
  // GET ALL SUBSCRIPTIONS DATA BY SUBSCRIPTION ID
  getSubscriptionDataBySubscriptionId: async (subscriptionId) => {
    const records = await db(TABLES.subscriptions)
      .select({
        filterByFormula: `subscription_id = "${subscriptionId}"`,
      })
      .all();

    if (records.length > 0) {
      return records.map((record) => ({
        recordId: record.id,
        ...record.fields,
      }));
    }
  },

  // ---------------------------------------------------------------------------------------------------------------------------------- //
  // GET STREAM DATA BY USER ID
  getStreamInfo: async (streamerId) => {
    try {
      const twitchAcessToken = await getOAuthTokenTwitch();
      const response = await axios.get(`https://api.twitch.tv/helix/streams?user_id=${streamerId}`, {
        headers: twitchAcessToken,
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
      const twitchAcessToken = await getOAuthTokenTwitch();
      const response = await axios.get(`https://api.twitch.tv/helix/games?id=${gameId}`, {
        headers: twitchAcessToken,
      });

      return response.data.data[0];
    } catch (error) {
      console.error("Erreur lors de la récupération des informations de la catégorie:", error);
    }
  },

  // ---------------------------------------------------------------------------------------------------------------------------------- //
  // SEND NOTIFICATION TO DISCORD WHEN STREAM ONLINE WITH DISCORD WEBHOOK
  sendMessageToDiscord: async (discordMessageData) => {
    const { streamerId, discordWebhook, displayName, streamerProfilPicture } = discordMessageData;

    // stream data
    const streamData = await getStreamInfo(streamerId);
    if (!streamData) {
      console.error("[ERROR GET STREAM INFO] sendMessageToDiscord: Stream data not found");
      return;
    }

    const { title, game_id } = streamData;

    // categorie data
    const categorieData = await getCategorieInfo(game_id);
    if (!categorieData) {
      console.error("[ERROR GET CATEGORIE INFO] sendMessageToDiscord: Categorie data not found");
      return;
    }

    const { name, box_art_url } = categorieData;

    const urlCategoriePicture = box_art_url.replace("{width}", "285").replace("{height}", "380");

    const message = discordEmbedMessage(displayName, title, name, urlCategoriePicture, streamerProfilPicture);
    await axios.post(discordWebhook, { embeds: [message], content: "@everyone" });
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

const { getStreamInfo, getCategorieInfo, discordEmbedMessage } = liveAlertMethods;

module.exports = liveAlertMethods;
