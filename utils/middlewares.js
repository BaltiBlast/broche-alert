// -------------------------------------------------------------------------------------------------------------------- //
// ===== IMPORTS ===== //
// npm
require("dotenv").config();

const { APP_URL } = process.env;

const middlewares = {
  // -------------------------------------------------------------------------------------------------------------------- //
  // ADD GENERIC PATHS TO RES.LOCALS
  genericPaths: (req, res, next) => {
    res.locals.paths = {
      // ROUTE AUTH
      AUTH: { signin: `${APP_URL}/signin`, signup: `${APP_URL}/signup`, signout: `${APP_URL}/signout` },
      USER: {
        profil: `${APP_URL}/profil/:username`,
        updateProfil: `${APP_URL}/update-profil`,
        deleteProfil: `${APP_URL}/delete-profil`,
        resetPassword: `${APP_URL}/reset-password`,
        requestResetPassword: `${APP_URL}/reset-password/request`,
        confirmResetPassword: `${APP_URL}/reset-password/confirm`,
      },
      GENERAL: {
        home: `${APP_URL}/`,
        about: `${APP_URL}/about`,
        contact: `${APP_URL}/contact`,
      },
      TOOLS: { liveAlert: `${APP_URL}/live-alert`, deleteSubscription: `${APP_URL}/delete-subscription` },
    };
    next();
  },

  // -------------------------------------------------------------------------------------------------------------------- //
  // ADD SUCCESS MESSAGE TO RES.LOCALS
  successMessage: (req, res, next) => {
    res.locals.successMessage = req.session.successMessage;
    req.session.successMessage = null;
    next();
  },

  // -------------------------------------------------------------------------------------------------------------------- //
  // ADD ERROR MESSAGE TO RES.LOCALS
  errorMessage: (req, res, next) => {
    res.locals.errorMessage = req.session.errorMessage;
    req.session.errorMessage = null;
    next();
  },

  // -------------------------------------------------------------------------------------------------------------------- //
  // STORE LOGGED USER IN LOCALS
  storeUserInLocals: (req, res, next) => {
    if (req.session && req.session.user) {
      res.locals.user = req.session.user;
    } else {
      res.locals.user = null;
    }
    next();
  },

  // -------------------------------------------------------------------------------------------------------------------- //
  // CHECK IF USER IS LOGGED IN
  ensureAuthenticated: (req, res, next) => {
    if (req.session && req.session.user) {
      return next();
    } else {
      req.session.errorMessage = "You need to be logged in to access this page";
      res.redirect("/signin");
    }
  },
};

module.exports = middlewares;
