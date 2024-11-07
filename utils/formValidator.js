// -------------------------------------------------------------------------------------------------------------------- //
// ===== IMPORTS ===== //
// npm
const { body } = require("express-validator");

// local
const { isEmailAlreadyExists } = require("../controllers/authController/authMethods.js");
const {
  getTwitchStreamerDataByName,
} = require("../controllers/toolsController/liveAlertController/liveAlertMethods.js");

const formValidator = {
  // -------------------------------------------------------------------------------------------------------------------- //
  // SIGNUP FORM VALIDATOR
  signupFormValidator: [
    body("firstname").isLength({ min: 2 }).withMessage("2 characters min"),
    body("lastname").isLength({ min: 2 }).withMessage("2 characters min"),
    body("username").isLength({ min: 2 }).withMessage("2 characters min"),
    body("email")
      .isEmail()
      .withMessage("A valid email is required")
      .custom(async (email) => {
        const emailChecker = await isEmailAlreadyExists(email);
        if (emailChecker) {
          throw new Error("Email already exists");
        }
      }),
    body("password").custom((value) => {
      if (value.length < 8) {
        throw new Error("8 characters min and a special symbol (@, !, ?)");
      }
      if (!/[\W_]/.test(value)) {
        throw new Error("8 characters min and a special symbol (@, !, ?)");
      }
      return true;
    }),
    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match.");
      }
      return true;
    }),
    body("birthdate").custom((value) => {
      if (!value) {
        throw new Error("Birth date is required.");
      }

      const birthdate = new Date(value);
      if (isNaN(birthdate.getTime())) {
        throw new Error("Birth date must be a valid date.");
      }

      const fourteenYearsAgo = new Date();
      fourteenYearsAgo.setFullYear(fourteenYearsAgo.getFullYear() - 14);

      if (birthdate > fourteenYearsAgo) {
        throw new Error("You must be at least 14 years old.");
      }

      return true;
    }),
  ],

  // -------------------------------------------------------------------------------------------------------------------- //
  // SIGNIN FORM VALIDATOR
  signinFormValidator: [
    body("email")
      .isEmail()
      .withMessage("A valid email is required")
      .custom(async (email) => {
        const emailChecker = await isEmailAlreadyExists(email);
        if (!emailChecker) {
          throw new Error("Email does not exist");
        }
      }),
    body("password").notEmpty().withMessage("Password is required"),
  ],

  // -------------------------------------------------------------------------------------------------------------------- //
  // UPDATE USER PROFIL FORM VALIDATOR
  updateUserProfilValidator: [
    body("firstname").isLength({ min: 2 }).withMessage("2 characters min"),
    body("lastname").isLength({ min: 2 }).withMessage("2 characters min"),
    body("username").isLength({ min: 2 }).withMessage("2 characters min"),
    body("email").isEmail().withMessage("A valid email is required"),
    body("birthdate").custom((value) => {
      if (!value) {
        throw new Error("Birth date is required.");
      }

      const birthdate = new Date(value);
      if (isNaN(birthdate.getTime())) {
        throw new Error("Birth date must be a valid date.");
      }

      const fourteenYearsAgo = new Date();
      fourteenYearsAgo.setFullYear(fourteenYearsAgo.getFullYear() - 14);

      if (birthdate > fourteenYearsAgo) {
        throw new Error("You must be at least 14 years old.");
      }

      return true;
    }),
  ],

  // -------------------------------------------------------------------------------------------------------------------- //
  // EMAIL RESET PASSWORD FORM REQUEST VALIDATOR
  emailResetPasswordRequestValidator: [body("email").isEmail().withMessage("A valid email is required")],

  // -------------------------------------------------------------------------------------------------------------------- //
  // EMAIL RESET PASSWORD FORM CONFIRM VALIDATOR
  emailResetPasswordConfirmValidator: [
    body("password").custom((value) => {
      if (value.length < 8) {
        throw new Error("8 characters min and a special symbol (@, !, ?)");
      }
      if (!/[\W_]/.test(value)) {
        throw new Error("8 characters min and a special symbol (@, !, ?)");
      }
      return true;
    }),
    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match.");
      }
      return true;
    }),
  ],

  // -------------------------------------------------------------------------------------------------------------------- //
  // EMAIL RESET PASSWORD FORM CONFIRM VALIDATOR
  formContactValidator: [
    body("subject").notEmpty().withMessage("Subject is required").isURL,
    body("email").isEmail().withMessage("A valid email is required"),
    body("message").notEmpty().withMessage("Message is required"),
  ],

  // -------------------------------------------------------------------------------------------------------------------- //
  // SET DISCORD WEBHOOK FORM VALIDATOR
  liveAlertFormsValidator: [
    body("formType").custom(async (value, { req }) => {
      if (value === "discord") {
        await body("discordWebhook").isURL().withMessage("A valid URL is required").run(req);
      } else if (value === "subscription") {
        await body("streamerName")
          .custom(async (streamerName) => {
            if (streamerName.length === 0) {
              throw new Error("Streamer name is required");
            }

            if (!/^[\w]+$/.test(streamerName)) {
              throw new Error("Streamer name should not contain spaces or special characters");
            }

            const streamerData = await getTwitchStreamerDataByName(streamerName);
            if (!streamerData) {
              throw new Error("Streamer not found");
            }
          })
          .run(req);
      }
      return true;
    }),
  ],
};

module.exports = formValidator;
