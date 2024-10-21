// ========= IMPORTS ========= //
// local
const { getAllSubscriptions } = require("../../methods/twitchMethods.js");

// ========= CONTROLLERS ========= //
const liveAlertsControllers = {
  // ---------------------------------------------------------------------------------------------------------------------------------- //
  // DESCRIPTION CONTROLLER 1
  getLiveAlerts: async (req, res) => {
    try {
      const usersSubscription = await getAllSubscriptions();

      res.render("liveAlerts", { streamers: usersSubscription, showNavbar: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = liveAlertsControllers;
