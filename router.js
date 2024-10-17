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

// ========= ROUTES ========= //
// -- GET
router.get("/check-subscriptions", getCheckSubscriptions);

// -- POST
router.post("/subscribe-to-live/:username", subscribeToLive);
router.post("/webhooks/callback", webhookCallback);

// -- DELETE
router.delete("/unsubscribe/:username", unsubscribeWebhook);

module.exports = router;
