// ========= IMPORTS ========= //
// local
const { getSubscriptionToDelete, deleteSubscription } = require("../../methods/twitchMethods.js");

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

      const subscriptionId = subscriptionToDelete.id;
      await deleteSubscription(subscriptionId);

      console.log(`Abonnement supprimé pour l'utilisateur ${username}.`);
      res.status(200).json({ message: `Abonnement supprimé pour l'utilisateur ${username}.` });
    } catch (error) {
      console.error("Erreur lors de la suppression de l'abonnement :", error.response?.data || error.message);
      res.status(500).json({ error: "Erreur lors de la suppression de l'abonnement.", message: error.message });
    }
  },
};

module.exports = deleteTwitchControllers;
