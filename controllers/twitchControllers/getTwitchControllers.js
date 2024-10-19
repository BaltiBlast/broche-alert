// ### IMPORTS ### //
// local
const { getAllSubscriptions } = require("../../methods/twitchMethods.js");

const getTwitchControllers = {
  // ---------------------------------------------------------------------------------------------------------------------------------- //
  getCheckSubscriptions: async (req, res) => {
    try {
      const usersSubscriptions = await getAllSubscriptions();
      usersSubscriptions.forEach((data) => {
        if (data.status === "enabled") {
          console.log(`L'eventsub ${data.type} pour ${data.user} est ${data.status} ✅`);
        } else {
          console.log(`L'eventsub ${data.type} pour ${data.user} est ${data.status} ❌`);
        }
      });
      res.status(200).json({ message: "Vérification des abonnements terminée" });
    } catch (error) {
      res.status(500).json({ error: "Erreur lors de la récupération des abonnements." });
    }
  },
};

module.exports = getTwitchControllers;
