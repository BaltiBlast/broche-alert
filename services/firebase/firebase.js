// ========= IMPORTS ========= //
// npm
const { initializeApp } = require("firebase/app");
require("dotenv").config();

// ========= CONFIG ========= //
const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MESSAGING_SENDER_ID,
  appId: process.env.APP_ID,
};

const firebaseApp = initializeApp(firebaseConfig);

// ========= EXPORTS ========= //
module.exports = firebaseApp;
