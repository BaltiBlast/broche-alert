// -------------------------------------------------------------------------------------------------------------------- //
// ===== IMPORTS ===== //
// npm
const express = require("express");

// local
const {
  signupFormValidator,
  signinFormValidator,
  updateUserProfilValidator,
  emailResetPasswordRequestValidator,
  emailResetPasswordConfirmValidator,
  formContactValidator,
  liveAlertFormsValidator,
} = require("./utils/formValidator.js");
const { ensureAuthenticated } = require("./utils/middlewares.js");

// controllers
const {
  postSignup,
  postSignin,
  getSignout,
  getSignup,
  getSignin,
} = require("./controllers/authController/authController.js");

const {
  postUpdateUserProfil,
  postDeleteProfile,
  getResetPassword,
  getUserProfil,
  postResetPasswordRequest,
  postResetPasswordConfirm,
} = require("./controllers/userController/userController.js");

const { postContact } = require("./controllers/generalController/generalController.js");
const { getHome, getAbout, getContact, get404 } = require("./controllers/generalController/generalController.js");
const {
  getLiveAlert,
  postLiveAlert,
  postWebhookCallback,
  postDeleteSubscription,
} = require("./controllers/toolsController/liveAlertController/liveAlertController.js");

// -------------------------------------------------------------------------------------------------------------------- //
// ===== SETUP ===== //
const router = express.Router();

// -------------------------------------------------------------------------------------------------------------------- //
// ===== ROUTES ===== //

// [GENERAL]
router.get("/", getHome);
// router.get("/about", getAbout); -> W.I.P
router.get("/contact", getContact);
router.post("/contact", formContactValidator, postContact);

// [AUTH]
router.get("/signin", getSignin);
router.post("/signin", signinFormValidator, postSignin);
router.get("/signup", getSignup);
router.post("/signup", signupFormValidator, postSignup);
router.get("/signout", getSignout);

// [USER]
router.post("/update-profil", ensureAuthenticated, updateUserProfilValidator, postUpdateUserProfil);
router.post("/delete-profil", ensureAuthenticated, postDeleteProfile);
router.get("/profil/:username", ensureAuthenticated, getUserProfil);
router.get("/reset-password", getResetPassword);
router.post("/reset-password/request", emailResetPasswordRequestValidator, postResetPasswordRequest);
router.post("/reset-password/confirm", emailResetPasswordConfirmValidator, postResetPasswordConfirm);

// [LIVE ALERT]
router.get("/live-alert", ensureAuthenticated, getLiveAlert);
router.post("/live-alert", ensureAuthenticated, liveAlertFormsValidator, postLiveAlert);
router.post("/webhook/callback", postWebhookCallback);
router.post("/delete-subscription", ensureAuthenticated, postDeleteSubscription);

// [404]
router.get("*", get404);

module.exports = router;
