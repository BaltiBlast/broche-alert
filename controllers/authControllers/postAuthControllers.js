// ========= IMPORTS ========= //
// npm
const { signInWithEmailAndPassword } = require("firebase/auth");

// local
const { auth } = require("../../services/config.js");

const loginController = {
  // ---------------------------------------------------------------------------------------------------------------------------------- //
  postSignin: async (req, res) => {
    try {
      const { email, password } = req.body;

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = { userEmail: userCredential.user.email, uid: userCredential.user.uid };

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
