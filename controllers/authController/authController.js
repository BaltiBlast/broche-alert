// -------------------------------------------------------------------------------------------------------------------- //
// ===== IMPORTS ===== //
// npm
const { validationResult } = require("express-validator");

// local
const { createNewUser, signinUser } = require("./authMethods.js");
const { sendEmail } = require("../../services/nodemailer.js");
const { welcomeEmail } = require("../../utils/emailMessage.js");

const authController = {
  // -------------------------------------------------------------------------------------------------------------------- //
  // [POST SIGNUP] //
  postSignup: async (req, res) => {
    try {
      // 1. Checks and validation form data using express-validator
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.render("signup", { errors: errors.array(), formData: req.body });
      }

      // 2. create a new user ( see authMethods.js for process )
      await createNewUser(req.body);

      // 3. Set a success message in the session
      req.session.successMessage = "Your account has been created successfully";

      // 4. Send a welcome email
      const { firstname, email } = req.body;
      const { GENERAL } = res.locals.paths;
      const emailOptions = welcomeEmail(firstname, email, GENERAL.contact);
      await sendEmail(emailOptions);

      // 5. Redirect to signin page
      res.redirect("/signin");
    } catch (error) {
      console.error("[ERROR POST SIGNUP] in authController.js :", error);
    }
  },

  // -------------------------------------------------------------------------------------------------------------------- //
  // [POST SIGNIN] //
  postSignin: async (req, res, next) => {
    try {
      // 1. Checks and validation form data using express-validator
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.render("signin", { errors: errors.array(), formData: req.body });
      }

      // 2. Signin the user ( see authMethods.js for process )
      const userData = await signinUser(req.body);

      // 3. If the user data is not found, set an error message in the session
      if (!userData) {
        req.session.errorMessage = "Email or password incorrect";
        return res.render("signin", { formData: req.body, errorMessage: req.session.errorMessage });
      }

      // 4. Set the user data in the session
      req.session.user = userData;

      res.redirect("/");
    } catch (error) {
      console.error("[ERROR POST SIGNIN] in authController.js :", error);
    }
  },

  // -------------------------------------------------------------------------------------------------------------------- //
  // [GET SIGNOUT] //
  getSignout: (req, res) => {
    req.session.destroy();
    res.redirect("/");
  },

  // -------------------------------------------------------------------------------------------------------------------- //
  // [GET SIGNUP] //
  getSignup: (req, res) => {
    res.render("signup");
  },

  // -------------------------------------------------------------------------------------------------------------------- //
  // [GET SIGNIN] //
  getSignin: (req, res) => {
    res.render("signin");
  },
};

module.exports = authController;
