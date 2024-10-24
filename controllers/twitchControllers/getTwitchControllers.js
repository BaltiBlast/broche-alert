// ========= IMPORTS ========= //
// local
const { getAllSubscriptions } = require("../../methods/twitchMethods.js");

const getTwitchControllers = {
  // ---------------------------------------------------------------------------------------------------------------------------------- //
  getCheckSubscriptions: async (req, res) => {
    try {
      const userId = req.session.userId;
      const usersSubscriptions = await getAllSubscriptions(userId);
      usersSubscriptions.forEach((data) => {
        if (data.status === "enabled") {
          console.log(`L'eventsub ${data.type} pour ${data.user} est ${data.status} ✅`);
        } else {
          console.error(`L'eventsub ${data.type} pour ${data.user} est ${data.status} ❌`);
        }
      });

      console.log("Vérification des abonnements terminée");
      res.status(200).json({ message: "Vérification des abonnements terminée" });
    } catch (error) {
      console.error("Erreur lors de la récupération des abonnements:", error.response?.data || error.message);
      res.status(500).json({ error: "Erreur lors de la récupération des abonnements." });
    }
  },
};

module.exports = getTwitchControllers;
