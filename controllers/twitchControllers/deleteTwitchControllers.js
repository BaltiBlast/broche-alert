// ========= IMPORTS ========= //
// npm
const axios = require("axios");
require("dotenv").config();

// local
const { getTwitchUserId, getOAuthToken } = require("../../methods/twitchMethods.js");

// ========= CONFIG ========= //
const { TWITCH_CLIENT_ID, TWITCH_EVENTSUB_URL } = process.env;

// ========= CONTROLLERS ========= //
const deleteTwitchControllers = {
  // ---------------------------------------------------------------------------------------------------------------------------------- //
  unsubscribeWebhook: async (req, res) => {
    const username = req.params.username;

    try {
      const userId = await getTwitchUserId(username);

      if (!userId) {
        return res.status(404).json({ error: "Utilisateur non trouvé." });
      }

      const accessToken = await getOAuthToken();
      const response = await axios.get(TWITCH_EVENTSUB_URL, {
        headers: {
          "Client-ID": TWITCH_CLIENT_ID,
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const subscriptions = response.data.data;
      const subscriptionToDelete = subscriptions.find((sub) => sub.condition.broadcaster_user_id === userId);

      if (!subscriptionToDelete) {
        return res.status(404).json({ error: `Aucun abonnement trouvé pour l'utilisateur ${username}.` });
      }

      const subscriptionId = subscriptionToDelete.id;

      await axios.delete(`${TWITCH_EVENTSUB_URL}?id=${subscriptionId}`, {
        headers: {
          "Client-ID": TWITCH_CLIENT_ID,
          Authorization: `Bearer ${accessToken}`,
        },
      });
      res.status(200).json({ message: `Abonnement supprimé pour l'utilisateur ${username}.` });
    } catch (error) {
      console.error("Erreur lors de la suppression de l'abonnement :", error.response?.data || error.message);
      res.status(500).json({ error: "Erreur lors de la suppression de l'abonnement." });
    }
  },
};

module.exports = deleteTwitchControllers;
