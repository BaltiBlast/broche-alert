// ========= IMPORTS ========= //
// npm
const router = require("express").Router();
require("dotenv").config();

// local
// --- MIDDLEWARES --- //
const middlewares = require("./methods/middlewares.js");
const { isUserAuthenticated } = middlewares;

// --- TWITCH --- //
const postTwitchControllers = require("./controllers/twitchControllers/postTwitchControllers.js");
const { subscribeToLive, webhookCallback } = postTwitchControllers;

const getTwitchControllers = require("./controllers/twitchControllers/getTwitchControllers.js");
const { getCheckSubscriptions } = getTwitchControllers;

const deleteTwitchControllers = require("./controllers/twitchControllers/deleteTwitchControllers.js");
const { unsubscribeWebhook } = deleteTwitchControllers;

// -- AUTH -- //
const postAuthControllers = require("./controllers/authControllers/postAuthControllers.js");
const { postSignin, postRegister, logout } = postAuthControllers;

const getAuthControllers = require("./controllers/authControllers/getAuthControllers.js");
const { getSignin, getRegister } = getAuthControllers;

const fakeDataStreamers = require("./utils/fakeDataStreamer.js");

// ========= ROUTES ========= //
// --- TWITCH --- //
router.get("/check-subscriptions", getCheckSubscriptions);
router.post("/subscribe-to-live/:username", subscribeToLive);
router.post("/webhooks/callback", webhookCallback);
router.delete("/unsubscribe/:username", unsubscribeWebhook);

// --- APP --- //
router.get("/live-alerts", isUserAuthenticated, (req, res) => {
  res.render("liveAlerts", { streamers: fakeDataStreamers, showNavbar: true });
});

// -- AUTH -- //
router.get("/signin", getSignin);
router.get("/register", getRegister);
router.get("/logout", logout);
router.post("/register", postRegister);

// -- POST
router.post("/signin", postSignin);

module.exports = router;
