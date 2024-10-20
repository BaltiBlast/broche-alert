// ========= IMPORTS ========= //
// local
const { subscriptionToStreamOnline, sendMessageToDiscord } = require("../../methods/twitchMethods.js");

// ========= CONFIG ========= //

// ========= CONTROLLERS ========= //
const postTwitchControllers = {
  // ---------------------------------------------------------------------------------------------------------------------------------- //
  subscribeToLive: async (req, res) => {
    try {
      const username = req.params.username;
      const subscribe = await subscriptionToStreamOnline(username);

      res.status(202).json({ message: "Abonnement à EventSub réussi", data: subscribe.data });
    } catch (error) {
      console.error("Erreur lors de l'inscription à EventSub :", error.response?.data || error.message);
      res.status(500).json({ error: "Erreur lors de l'inscription à EventSub" });
    }
  },

  // ---------------------------------------------------------------------------------------------------------------------------------- //
  webhookCallback: async (req, res) => {
    const messageType = req.headers["twitch-eventsub-message-type"];

    try {
      if (messageType === "webhook_callback_verification") {
        return res.status(200).send(req.body.challenge);
      }
    } catch (error) {
      res.status(500).json({ error: "Erreur lors de la vérification du webhook.", message: error.message });
    }

    try {
      if (messageType === "notification" && req.body.subscription.type === "stream.online") {
        const userId = req.body.event.broadcaster_user_id;

        // Send message to Discord
        await sendMessageToDiscord(userId);
        res.sendStatus(200);
      }
    } catch (error) {
      res.status(500).json({ error: "Erreur pendant", message: error.message });
    }
  },
};

module.exports = postTwitchControllers;
