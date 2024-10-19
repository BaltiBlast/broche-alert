// ========= IMPORTS ========= //
// npm
const { signInWithEmailAndPassword } = require("firebase/auth");

// local
const { auth } = require("../services/config.js");

// ========= CONFIG ========= //

// ========= METHODS ========= //
const authMethods = {
  // ---------------------------------------------------------------------------------------------------------------------------------- //
  // CHECK USER CREDENTIAL VALIDITY FOR SIGNIN
  isUserCredentialsOk: async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = { userEmail: userCredential.user.email, uid: userCredential.user.uid };
      return user;
    } catch (error) {
      console.error("Erreur lors de la connexion", error.message);
    }
  },
};

module.exports = authMethods;
