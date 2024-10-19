// ========= IMPORTS ========= //
// npm
const { signInWithEmailAndPassword, createUserWithEmailAndPassword } = require("firebase/auth");

// local
const { db, auth } = require("../services/config.js");

// ========= CONFIG ========= //

// ========= METHODS ========= //
const authMethods = {
  // ---------------------------------------------------------------------------------------------------------------------------------- //
  // CHECK USER CREDENTIAL VALIDITY FOR SIGNIN
  isUserCredentialsOk: async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = { userEmail: userCredential.user.email, userId: userCredential.user.uid };
    return user;
  },

  // ---------------------------------------------------------------------------------------------------------------------------------- //
  // REGISTER NEW USER IN FIREBASE AUTH
  registerNewUser: async (email, password) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential;
  },

  // ---------------------------------------------------------------------------------------------------------------------------------- //
  // REGISTER USER INFO IN AIRTABLE
  registerUserInformationsInAirtable: async (objectUserInfo) => {
    const { id, lastname, firstname, username, email, birthdate } = objectUserInfo;
    await db("users").create([
      {
        fields: {
          id: id,
          lastname: lastname,
          firstname: firstname,
          username: username,
          email: email,
          birthdate: birthdate,
        },
      },
    ]);
  },
};

module.exports = authMethods;
