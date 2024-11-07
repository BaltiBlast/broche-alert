// -------------------------------------------------------------------------------------------------------------------- //
// ===== IMPORTS ===== //
// npm
const { validationResult } = require("express-validator");

// local
const { setUserDiscordWebhook, getUserByEmail, getUserDataByUserId } = require("../../userController/userMethods.js");
const {
  subscriptionToTwitchWebhook,
  getTwitchStreamerDataByName,
  isSubscriptionAlreadyExists,
  addSubscription,
  getSubscriptionDataWithStreamerId,
  isUserAlreadySubscribed,
  getSubscriptionDataByUserId,
  isTheLastSubscriptionId,
  deleteSubscription,
  deleteTwitchWebhookSubscription,
  getSubscriptionDataBySubscriptionId,
  sendMessageToDiscord,
} = require("./liveAlertMethods.js");

const liveAlertController = {
  // -------------------------------------------------------------------------------------------------------------------- //
  // [GET LIVE ALERT] //
  getLiveAlert: async (req, res) => {
    const { user } = req.session;
    const subscriptions = await getSubscriptionDataByUserId(user.user_id);

    res.render("live-alert.pug", { subscriptions });
  },

  // -------------------------------------------------------------------------------------------------------------------- //
  // [POST DELETE SUBSCRIPTION] //
  postDeleteSubscription: async (req, res) => {
    const { subscriptionId, recordId } = req.body;

    try {
      // 1. Verify how much subscription id left in BDD
      const isLastSubscription = await isTheLastSubscriptionId(subscriptionId);

      // 2. If only one subscription left, delete the subscription in BDD + twitch webhook
      if (isLastSubscription === 1) {
        // 1. Delete subscription in BDD
        await deleteSubscription(recordId);
        // 2. Delete subscription in Twitch webhook
        await deleteTwitchWebhookSubscription(subscriptionId);
      }

      // 3. If more than one subscription left, delete the subscription BDD only
      if (isLastSubscription > 1) {
        // 1. Delete subscription in BDD
        await deleteSubscription(recordId);
      }

      // 4. Redirect to live-alert
      res.redirect("/live-alert");
    } catch (error) {
      console.error("[ERROR POST DELETE SUBSCRIPTION] postDeleteSubscription:", error);
    }
  },

  // -------------------------------------------------------------------------------------------------------------------- //
  // [POST LIVE ALERT] //
  postLiveAlert: async (req, res) => {
    const { discordWebhook, formType } = req.body;
    const { user } = req.session;

    // 1. Checks and validation form data using express-validator
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.render("live-alert", { errors: errors.array(), formData: req.body });
    }

    // 2. Check formType
    //------- DISCORD
    if (formType === "discord") {
      try {
        // 1. Desctructure user data
        const { recordId, email } = user;

        // 2. Check if Discord webhook is already set
        const discordWebhookURL = await setUserDiscordWebhook(discordWebhook, recordId);
        if (discordWebhookURL) {
          req.session.successMessage = "Discord webhook successfully saved";
        }

        // 4. Fetch updated user data
        const updatedUser = await getUserByEmail(email);

        // 5. Update session with new user data
        req.session.user = updatedUser;

        res.redirect("/live-alert");
      } catch (error) {
        console.error("[ERROR POST LIVE ALERT - DISCORD] postLiveAlert:", error);
      }
    }

    //------- TWITCH
    if (formType === "subscription") {
      try {
        // 1. Destrucre user data
        const { streamerName } = req.body;

        // 2. Get streamer data
        const streamerData = await getTwitchStreamerDataByName(streamerName);

        // 3. Verify if subscription exist in Database
        const isSubscriptionExist = await isSubscriptionAlreadyExists(streamerData.id);

        if (!isSubscriptionExist) {
          // Subscribe to Twitch webhook
          const subscription = await subscriptionToTwitchWebhook(streamerData.id);

          // Create subscription object
          const subsciptionObject = {
            subscriptionId: subscription.data[0].id,
            streamerId: streamerData.id,
            userId: user.user_id,
            streamerName: streamerData.login,
            streamerProfileImage: streamerData.profile_image_url,
          };

          // Add subscription in BDD
          await addSubscription(subsciptionObject);
          res.redirect("/live-alert");
        } else if (isSubscriptionExist) {
          const isUserSubscribed = await isUserAlreadySubscribed(user.user_id, streamerData.id);

          if (isUserSubscribed) {
            const customErrors = [
              {
                msg: "You are already subscribed to this streamer",
                path: "streamerName",
              },
            ];
            return res.render("live-alert.pug", { errors: customErrors });
          }

          const subscriptionData = await getSubscriptionDataWithStreamerId(streamerData.id);

          // Add subscription in BDD
          const subsciptionObject = {
            subscriptionId: subscriptionData.subscription_id,
            streamerId: streamerData.id,
            userId: user.user_id,
            streamerName: streamerData.login,
            streamerProfileImage: streamerData.profile_image_url,
          };

          await addSubscription(subsciptionObject);
          res.redirect("/live-alert");
        }
      } catch (error) {
        console.error("[ERROR POST LIVE ALERT - TWITCH] postLiveAlert:", error);
      }
    }
  },

  postWebhookCallback: async (req, res, next) => {
    const formType = req.headers["twitch-eventsub-message-type"];

    if (formType === "webhook_callback_verification") {
      try {
        const challenge = req.body.challenge;
        res.status(200).send(challenge);
      } catch (error) {
        console.error("[ERROR POST WEBHOOK CALLBACK VERIFICATION] postWebhookCallback:", error);
      }
    }

    if (formType === "notification") {
      const subscriptionId = req.body.subscription.id;

      try {
        const subscriptions = await getSubscriptionDataBySubscriptionId(subscriptionId);

        await Promise.all(
          subscriptions.map(async (subscription) => {
            const { user_id, streamer_id } = subscription;

            // 1. Get user data
            const user = await getUserDataByUserId(user_id);
            const { discord_webhook } = user;

            const discordMessageData = {
              streamerId: streamer_id,
              discordWebhook: discord_webhook,
              displayName: subscription.streamer_name,
              streamerProfilPicture: subscription.streamer_profile_image,
            };

            await sendMessageToDiscord(discordMessageData);
          })
        );
        res.sendStatus(200);
      } catch (error) {
        console.error("[ERROR POST WEBHOOK CALLBACK NOTIFICATION] postWebhookCallback:", error);
      }
    }
  },
};

module.exports = liveAlertController;
