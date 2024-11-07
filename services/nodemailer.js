// -------------------------------------------------------------------------------------------------------------------- //
// ===== IMPORTS ===== //
// npm
const nodemailer = require("nodemailer");
require("dotenv").config();

// ===== CONFIG ===== //
const { GOOGLE_EMAIL_ADRESS, GOOGLE_APP_KEY } = process.env;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: GOOGLE_EMAIL_ADRESS,
    pass: GOOGLE_APP_KEY,
  },
});

const sendEmail = async (emailOptions) => {
  await transporter.sendMail(emailOptions);
};

module.exports = { sendEmail };
