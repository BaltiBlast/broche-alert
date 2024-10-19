// ========= IMPORTS ========= //
// npm
const { getAuth } = require("firebase/auth");

// local
const firebaseApp = require("./firebase/firebase.js");

// ========= CONFIGS ========= //
const auth = getAuth(firebaseApp);

module.exports = { auth };
