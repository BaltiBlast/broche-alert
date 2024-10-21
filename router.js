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

// -- VIEWS -- //
const liveAlertsControllers = require("./controllers/viewsControllers/liveAlertsControllers.js");
const { getLiveAlerts } = liveAlertsControllers;

// ========= ROUTES ========= //
// --- TWITCH --- //
router.get("/check-subscriptions", getCheckSubscriptions);
router.post("/subscribe-to-live", subscribeToLive);
router.post("/webhooks/callback", webhookCallback);
router.delete("/unsubscribe/:username", unsubscribeWebhook);

// --- APP --- //
router.get("/", (req, res) => {
  res.render("home", { showNavbar: true });
});
router.get("/live-alerts", isUserAuthenticated, getLiveAlerts);

// -- AUTH -- //
router.get("/signin", getSignin);
router.get("/register", getRegister);
router.get("/logout", logout);
router.post("/register", postRegister);

// -- POST
router.post("/signin", postSignin);

module.exports = router;
