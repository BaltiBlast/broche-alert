// ========= IMPORTS ========= //
// local
const { getSubscriptionToDelete, deleteSubscription } = require("../../methods/twitchMethods.js");
const { deleteLiveAlertsSubscriptionInAirtable } = require("../../methods/dbMethods.js");

// ========= CONTROLLERS ========= //
const deleteTwitchControllers = {
  // ---------------------------------------------------------------------------------------------------------------------------------- //
  unsubscribeWebhook: async (req, res) => {
    const username = req.params.username;
    try {
      const subscriptionToDelete = await getSubscriptionToDelete(username);

      if (!subscriptionToDelete) {
        return res.status(404).json({ error: `Aucun abonnement trouvé pour l'utilisateur ${username}.` });
      }

      // Get the subscription/webhook ID
      const subscriptionId = subscriptionToDelete.id;

      // Delete the subscription on Twitch
      await deleteSubscription(subscriptionId);

      // Delete the subscription in Airtable
      await deleteLiveAlertsSubscriptionInAirtable(subscriptionId);

      res.redirect("/live-alerts");
    } catch (error) {
      console.error("Erreur lors de la suppression de l'abonnement :", error.response?.data || error.message);
      res.status(500).json({ error: "Erreur lors de la suppression de l'abonnement.", message: error.message });
    }
  },
};

module.exports = deleteTwitchControllers;
