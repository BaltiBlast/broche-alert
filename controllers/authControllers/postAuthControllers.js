// ========= IMPORTS ========= //
// local
const {
  isUserCredentialsOk,
  registerNewUser,
  registerUserInformationsInAirtable,
} = require("../../methods/authMethods.js");

const loginController = {
  // ---------------------------------------------------------------------------------------------------------------------------------- //
  // SIGNIN POST REQUEST
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
  // POST REGISTER REQUEST
  postRegister: async (req, res) => {
    const { firstname, lastname, username, email, password, confirmPassword, birthdate } = req.body;

    try {
      // password confirmation
      if (password !== confirmPassword) {
        console.error("Passwords do not match");
        return res.status(400).json({ message: "Passwords do not match" });
      }

      // register new user
      const userCredential = await registerNewUser(email, password);

      // Get the user id
      const uid = userCredential.user.uid;

      // Create an object with the user information
      const objectUserInfo = {
        id: uid,
        lastname: lastname,
        firstname: firstname,
        username: username,
        email: email,
        birthdate: birthdate,
      };

      // Register the user information in Airtable
      await registerUserInformationsInAirtable(objectUserInfo);
      res.redirect("/signin");
    } catch (error) {
      console.error("Error registering user", error.message);
      res.status(500).json({ message: "Error registering user", error: error.message });
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
