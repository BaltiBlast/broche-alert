// ========= IMPORTS ========= //
// local
const { getSubscriptionToDelete, deleteSubscription } = require("../../methods/twitchMethods.js");

// ========= CONTROLLERS ========= //
const deleteTwitchControllers = {
  // ---------------------------------------------------------------------------------------------------------------------------------- //
  unsubscribeWebhook: async (req, res) => {
    const username = req.params.username;

    try {
      // Get the subscription to delete
      const subscriptionToDelete = await getSubscriptionToDelete(username);

      if (!subscriptionToDelete) {
        return res.status(404).json({ error: `Aucun abonnement trouvé pour l'utilisateur ${username}.` });
      }

      const subscriptionId = subscriptionToDelete.id;

      // Delete the subscription
      await deleteSubscription(subscriptionId);
      res.status(200).json({ message: `Abonnement supprimé pour l'utilisateur ${username}.` });
    } catch (error) {
      res.status(500).json({ error: "Erreur lors de la suppression de l'abonnement.", message: error.message });
    }
  },
};

module.exports = deleteTwitchControllers;
