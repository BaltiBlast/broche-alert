// -------------------------------------------------------------------------------------------------------------------- //
// ===== IMPORTS ===== //
// npm
const express = require("express");
const session = require("express-session");
require("dotenv").config();

// local
const router = require("./router");
const { genericPaths, successMessage, errorMessage, storeUserInLocals } = require("./utils/middlewares");

// -------------------------------------------------------------------------------------------------------------------- //
// ===== SETUP ===== //
const app = express();
const PORT = 3000;
app.set("view engine", "pug");
app.set("views", "./views");

// -------------------------------------------------------------------------------------------------------------------- //
// ===== MIDDLEWARES ===== //
app.use(express.static("public"));
app.use(genericPaths);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.COOKIE_SECURE === "production",
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);
app.use(storeUserInLocals);
app.use(successMessage, errorMessage);
app.use(router);

// -------------------------------------------------------------------------------------------------------------------- //
// ===== SERVER ===== //
app.listen(PORT, () => {
  console.log(`Broche is turning on http://localhost:${PORT}`);
});
