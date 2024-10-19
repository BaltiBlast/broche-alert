// ========= IMPORTS ========= //
// npm
const { getAuth } = require("firebase/auth");

// local
const firebaseApp = require("./firebase/firebase.js");
const base = require("../services/airtable/airtable.js");

// ========= CONFIGS ========= //
const auth = getAuth(firebaseApp);
const db = base;

module.exports = { auth, db };
