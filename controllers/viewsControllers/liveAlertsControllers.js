// ========= IMPORTS ========= //
// local
const { getAllSubscriptions } = require("../../methods/twitchMethods.js");

// ========= CONTROLLERS ========= //
const liveAlertsControllers = {
  // ---------------------------------------------------------------------------------------------------------------------------------- //
  // DESCRIPTION CONTROLLER 1
  getLiveAlerts: async (req, res) => {
    try {
      const userId = req.session.user.id;
      const usersSubscription = await getAllSubscriptions(userId);

      res.render("liveAlerts", { streamers: usersSubscription, showNavbar: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = liveAlertsControllers;
