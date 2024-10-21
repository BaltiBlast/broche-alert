// ========= IMPORTS ========= //
// local
const { subscriptionToStreamOnline, sendMessageToDiscord } = require("../../methods/twitchMethods.js");
const { registerLiveAlertsSubscriptionInAirtable } = require("../../methods/dbMethods.js");

// ========= CONFIG ========= //

// ========= CONTROLLERS ========= //
const postTwitchControllers = {
  // ---------------------------------------------------------------------------------------------------------------------------------- //
  subscribeToLive: async (req, res) => {
    try {
      // const username = req.params.username;
      const username = req.body.username;
      await subscriptionToStreamOnline(username);
      res.redirect("/live-alerts");
    } catch (error) {
      console.error("Erreur lors de l'inscription à EventSub :", error.response?.data || error.message);
      res.status(500).json({ error: "Erreur lors de l'inscription à EventSub" });
    }
  },

  // ---------------------------------------------------------------------------------------------------------------------------------- //
  webhookCallback: async (req, res) => {
    const messageType = req.headers["twitch-eventsub-message-type"];

    if (messageType === "webhook_callback_verification") {
      try {
        // Send back the challenge to verify the webhook
        res.status(200).send(req.body.challenge);
        // Get stream id
        const streamerId = req.body.subscription.condition.broadcaster_user_id;

        // Create object to register in Airtable
        const objectSubscriptionInfo = {
          webhookId: req.body.subscription.id,
          streamerId: streamerId,
        };

        // Register in Airtable
        await registerLiveAlertsSubscriptionInAirtable(objectSubscriptionInfo);
        return;
      } catch (error) {
        return res.status(500).json({ error: "Erreur lors de la vérification du webhook.", message: error.message });
      }
    }

    if (messageType === "notification" && req.body.subscription.type === "stream.online") {
      try {
        if (messageType === "notification" && req.body.subscription.type === "stream.online") {
          const userId = req.body.event.broadcaster_user_id;

          // Send message to Discord
          await sendMessageToDiscord(userId);
          return res.sendStatus(200);
        }
      } catch (error) {
        return res.status(500).json({ error: "Erreur lors de la vérification du webhook.", message: error.message });
      }
    }
  },
};

module.exports = postTwitchControllers;
