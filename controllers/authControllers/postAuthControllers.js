// ========= IMPORTS ========= //
// local
const { isUserCredentialsOk } = require("../../methods/authMethods.js");

const loginController = {
  // ---------------------------------------------------------------------------------------------------------------------------------- //
  postSignin: async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await isUserCredentialsOk(email, password);

      req.session.user = user;
      res.redirect("/live-alerts");
    } catch (error) {
      res.status(500).json({ error: "Erreur lors de la connexion", message: error.message });
    }
  },

  // ---------------------------------------------------------------------------------------------------------------------------------- //
  logout: (req, res, next) => {
    req.session.destroy();
    res.redirect("/signin");
  },
};

// === EXPORTS === //
module.exports = loginController;
