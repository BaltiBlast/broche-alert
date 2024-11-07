// -------------------------------------------------------------------------------------------------------------------- //
// ===== IMPORTS ===== //
// npm
const { validationResult } = require("express-validator");
require("dotenv").config();

// local
const {
  updateUserProfil,
  isNewEmailAlreadyExists,
  getUserByEmail,
  deleteProfile,
  saveTokenForForgotPassword,
  getResetToken,
  updateUserPassword,
  destroyResetPasswordToken,
} = require("./userMethods.js");

const { sendEmail } = require("../../services/nodemailer.js");
const { resetPasswordEmail } = require("../../utils/emailMessage.js");

const {
  dateFormater,
  hashPassword,
  generateRandomToken,
  generateExpirationDate,
} = require("../../utils/genericMethods.js");

const userController = {
  // -------------------------------------------------------------------------------------------------------------------- //
  // [POST UPDATE PROFIL] //
  postUpdateUserProfil: async (req, res) => {
    try {
      // 1. Checks and validation form data using express-validator
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.render("user-profil", { errors: errors.array(), formData: req.body });
      }

      //. 2. Check if email already exists
      const currentEmail = req.session.user.email;
      const newEmail = req.body.email;
      const emailCkecker = await isNewEmailAlreadyExists(newEmail, currentEmail);

      if (emailCkecker) {
        return res.render("user-profil", {
          errors: [{ path: "email", msg: "Email address not available", formData: req.body }],
        });
      }

      // 3. Update the user profile
      const objetUserData = { user: req.body, currentEmail };
      await updateUserProfil(objetUserData);

      // 4. Fetch updated user data
      const updatedUser = await getUserByEmail(newEmail);

      // 5. Update session with new user data
      req.session.user = updatedUser;

      // 6. Add a success message
      req.session.successMessage = "Profile updated successfully";

      // 7. Redirect to the user profile page
      const username = req.body.username;
      res.redirect(`/profil/${username.toLowerCase()}`);
    } catch (error) {
      console.error("[ERROR POST UPDATE USER PROFILE] in userController.js :", error);
    }
  },

  // -------------------------------------------------------------------------------------------------------------------- //
  // [POST DELETE PROFIL] //
  postDeleteProfile: async (req, res) => {
    try {
      // 1. Get user email
      const email = req.session.user.email;

      // 2. Delete user profile
      await deleteProfile(email);

      // 3. Destroy session
      req.session.destroy();

      // 4. Redirect to home page
      res.redirect("/");
    } catch (error) {
      console.error("[ERROR POST DELETE PROFILE] in userController.js :", error);
    }
  },

  // -------------------------------------------------------------------------------------------------------------------- //
  // [POST RESET PASSWORD REQUEST]
  postResetPasswordRequest: async (req, res) => {
    // 1. Checks and validation form data using express-validator
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.render("reset-password.pug", { errors: errors.array(), formData: req.body, requestReset: true });
    }

    try {
      // 2. Get user data by email
      const { email } = req.body;
      const user = await getUserByEmail(email);

      if (!user) {
        req.session.successMessage = "If an email exists, a reset link will be sent.";
        return res.redirect("/reset-password");
      }

      // 3. Generate random token
      const resetToken = generateRandomToken();

      // 4. Create 5min expiration date & format it
      const expirationDate = generateExpirationDate(5);
      const formattedExpirationDate = dateFormater(expirationDate);

      // 5. Save token in the database
      await saveTokenForForgotPassword(user.user_id, resetToken, expirationDate, user.recordId);

      // 6. Construct reset link
      const resetLink = `${process.env.APP_URL}/reset-password?token=${resetToken}&userId=${user.user_id}`;

      // 7. Construct email message
      const emailOption = resetPasswordEmail(user.first_name, user.email, resetLink, formattedExpirationDate);

      // 8. Send email
      await sendEmail(emailOption);

      // 9. Add success message
      req.session.successMessage = "If an email exists, a reset link will be sent.";

      // 10. Redirect to reset password page
      return res.redirect("/reset-password");
    } catch (error) {
      console.error("[ERROR POST RESET PASSWORD REQUEST] in userController.js :", error);
    }
  },

  // -------------------------------------------------------------------------------------------------------------------- //
  // [POST RESET PASSWORD CONFIRM]
  postResetPasswordConfirm: async (req, res) => {
    const { password, token, userId } = req.body;

    // 1. Checks and validation form data
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      req.session.errorMessage = "Passwords do not meet the required format.";
      return res.redirect(`/reset-password?token=${token}&userId=${userId}`);
    }

    try {
      // 2. Get user data
      const { record_id, reccordTokenId } = await getResetToken(userId, token);

      // 3. Hach new password
      const hashedNewPassword = await hashPassword(password);

      // 4. Update user password
      const updatePassword = await updateUserPassword(hashedNewPassword, record_id);

      if (!updatePassword) {
        req.session.errorMessage = "An error occurred, please try again.";
        return res.redirect(`/reset-password?token=${token}&userId=${userId}`);
      }

      // 5. Destroy reset token
      await destroyResetPasswordToken(reccordTokenId);

      // 6. Add success message
      req.session.successMessage = "Password updated successfully";

      // 7. Redirect to login page
      res.redirect("/signin");
    } catch (error) {
      console.error("[ERROR POST RESET PASSWORD CONFIRM] in userController.js :", error);
    }
  },

  // -------------------------------------------------------------------------------------------------------------------- //
  // [GET RESET PASSWORD] //
  getResetPassword: async (req, res) => {
    const { token, userId } = req.query;

    if (!token || !userId) {
      return res.render("reset-password.pug", { requestReset: true });
    }

    try {
      // 1. Compare token and userId with the database
      const resetToken = await getResetToken(userId, token);

      if (!resetToken) {
        return res.render("reset-password.pug", { errorLink: true });
      }

      // 2. Check if token is expired
      const { expiration_date } = resetToken;
      const expirationDate = new Date(expiration_date);

      if (expirationDate < new Date() || !resetToken) {
        return res.render("reset-password.pug", { errorLink: true });
      }

      // 3. Render reset password page
      return res.render("reset-password.pug", { changePassword: true, token, userId });
    } catch (error) {
      console.error("[ERROR GET RESET PASSWORD] in userController.js :", error);
    }
  },

  // -------------------------------------------------------------------------------------------------------------------- //
  // [GET USER PROFIL] //
  getUserProfil: (req, res) => {
    res.render("user-profil.pug");
  },
};

module.exports = userController;
