// ========= IMPORTS ========= //
// npm
const express = require("express");
const router = require("./router");
const session = require("express-session");
require("dotenv").config();

// local
const { setUserDataGlobal, setGlobalRoutes } = require("./methods/middlewares.js");

// ========= CONFIG ========= //
const app = express();
const PORT = process.env.PORT || 3000;

// ========= VIEW ENGINE ========= //
app.set("view engine", "ejs");
app.set("views", "./views");

// ========= MIDDLEWARES ========= //
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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

app.use(setUserDataGlobal);
app.use(setGlobalRoutes);
app.use(router);

// ========= SERVER ========= //
app.listen(PORT, () => {
  console.log(`La broche tourne sur http://localhost:${PORT}`);
});
