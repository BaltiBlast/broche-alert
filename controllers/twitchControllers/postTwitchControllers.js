// ========= IMPORTS ========= //
// npm
const axios = require("axios");
require("dotenv").config();

// local
const {
  getOAuthToken,
  getTwitchUserId,
  getUserInfo,
  getStreamInfo,
  getCategorieInfo,
} = require("../../methods/twitchMethods.js");

// ========= CONFIG ========= //
const { TWITCH_CLIENT_ID, TWITCH_EVENTSUB_URL, TWITCH_CALLBACK_URL, TWITCH_SECRET } = process.env;

// ========= CONTROLLERS ========= //
const postTwitchControllers = {
  // ---------------------------------------------------------------------------------------------------------------------------------- //
  subscribeToLive: async (req, res) => {
    try {
      const username = req.params.username;
      const userId = await getTwitchUserId(username);
      const accessToken = await getOAuthToken();

      if (!userId) {
        return res.status(400).json({ error: "L'ID de la chaîne Twitch est requis." });
      }

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

      res.status(202).json({ message: "Abonnement à EventSub réussi", data: response.data });
    } catch (error) {
      console.error("Erreur lors de l'inscription à EventSub:", error.response?.data || error.message);
      res.status(500).json({ error: "Erreur lors de l'inscription à EventSub" });
    }
  },

  // ---------------------------------------------------------------------------------------------------------------------------------- //
  webhookCallback: async (req, res) => {
    const messageType = req.headers["twitch-eventsub-message-type"];

    if (messageType === "webhook_callback_verification") {
      return res.status(200).send(req.body.challenge);
    }

    if (messageType === "notification" && req.body.subscription.type === "stream.online") {
      const userId = req.body.event.broadcaster_user_id;

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

      try {
        await axios.post(DISCORD_WEBHOOK, { embeds: [discordEmbed] });
        console.log("Message envoyé sur Discord");
      } catch (error) {
        console.error("Erreur lors de l'envoi du message Discord:", error);
      }
    }

    res.sendStatus(200);
  },
};

module.exports = postTwitchControllers;
