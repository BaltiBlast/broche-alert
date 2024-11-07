// -------------------------------------------------------------------------------------------------------------------- //
// ===== IMPORTS ===== //
// npm
const { validationResult } = require("express-validator");

// local
const { contactEmail } = require("../../utils/emailMessage");
const { sendEmail } = require("../../services/nodemailer.js");

const generalController = {
  // -------------------------------------------------------------------------------------------------------------------- //
  // [GET HOME] //
  getHome: (req, res) => {
    res.render("home.pug");
  },

  // -------------------------------------------------------------------------------------------------------------------- //
  // [GET ABOUT] //
  getAbout: (req, res) => {
    res.render("about.pug");
  },

  // -------------------------------------------------------------------------------------------------------------------- //
  // [POST CONTACT] //
  postContact: async (req, res) => {
    // 1. Checks and validation form data using express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("contact.pug", { errors: errors.array(), formData: req.body, requestReset: true });
    }

    console.log("REQ BODY: ", req.body);

    const { email, message, subject } = req.body;
    const emailOption = contactEmail(email, message, subject);

    await sendEmail(emailOption);

    res.render("contact.pug");
  },

  // -------------------------------------------------------------------------------------------------------------------- //
  // [GET CONTACT] //
  getContact: (req, res) => {
    res.render("contact.pug");
  },

  // -------------------------------------------------------------------------------------------------------------------- //
  // [GET 404] //
  get404: (req, res) => {
    res.render("404.pug");
  },
};

module.exports = generalController;
