// ========= IMPORTS ========= //
// npm
const router = require("express").Router();
require("dotenv").config();

// local
const postTwitchControllers = require("./controllers/twitchControllers/postTwitchControllers.js");
const { subscribeToLive, webhookCallback } = postTwitchControllers;

const getTwitchControllers = require("./controllers/twitchControllers/getTwitchControllers.js");
const { getCheckSubscriptions } = getTwitchControllers;

const deleteTwitchControllers = require("./controllers/twitchControllers/deleteTwitchControllers.js");
const { unsubscribeWebhook } = deleteTwitchControllers;

const fakeDataStreamers = require("./utils/fakeDataStreamer.js");

// ========= ROUTES ========= //
// --- TWITCH --- //
// -- GET
router.get("/check-subscriptions", getCheckSubscriptions);

// -- POST
router.post("/subscribe-to-live/:username", subscribeToLive);
router.post("/webhooks/callback", webhookCallback);

// -- DELETE
router.delete("/unsubscribe/:username", unsubscribeWebhook);

// --- APP --- //
router.get("/live-alerts", (req, res) => {
  res.render("liveAlerts", { streamers: fakeDataStreamers });
});

router.get("/signin", (req, res) => {
  res.render("signin");
});

module.exports = router;
