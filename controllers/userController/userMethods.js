// -------------------------------------------------------------------------------------------------------------------- //
// ===== IMPORTS ===== //
// local
const { db, TABLES } = require("../../services/airtable.js");

const userMethods = {
  // -------------------------------------------------------------------------------------------------------------------- //
  // UPDATE USER PROFILE - [return object]
  updateUserProfil: async (objetUserData) => {
    const { firstname, lastname, username, email, birthdate, recordId } = objetUserData.user;

    const updatedRecord = await db(TABLES.users).update(recordId, {
      email: email,
      last_name: lastname,
      first_name: firstname,
      username: username,
      birthdate: birthdate,
    });

    return updatedRecord;
  },

  // -------------------------------------------------------------------------------------------------------------------- //
  // UPDATE USER PASSWORD - [return object]
  updateUserPassword: async (password, recordId) => {
    const updatePassword = await db(TABLES.users).update(recordId, {
      password: password,
    });

    if (updatePassword.length === 0) {
      return;
    }

    return updatePassword;
  },

  // -------------------------------------------------------------------------------------------------------------------- //
  // DESTROY RESET PASSWORD - [return object]
  destroyResetPasswordToken: async (recordId) => {
    const deletedRecord = await db(TABLES.reset_password).destroy(recordId);
    return deletedRecord;
  },

  // -------------------------------------------------------------------------------------------------------------------- //
  // CHECK IF THE NEW EMAIL ALREADY EXISTS - [return boolean]
  isNewEmailAlreadyExists: async (newEmail, currentEmail) => {
    const records = await db(TABLES.users)
      .select({
        filterByFormula: `AND(email = "${newEmail}", email != "${currentEmail}")`,
      })
      .all();

    return records.length > 0;
  },

  // -------------------------------------------------------------------------------------------------------------------- //
  // GET USER DATA BY EMAIL - [return object]
  getUserByEmail: async (email) => {
    const records = await db(TABLES.users)
      .select({
        filterByFormula: `email = "${email}"`,
      })
      .all();

    if (records.length === 0) {
      return false;
    }

    // Extract user fields and record ID
    const { id: recordId, fields: user } = records[0];
    const { password, ...userData } = user;
    return { ...userData, recordId };
  },

  // -------------------------------------------------------------------------------------------------------------------- //
  // GET USER DATA BY USER ID - [return object]
  getUserDataByUserId: async (userId) => {
    const records = await db(TABLES.users)
      .select({
        filterByFormula: `user_id = "${userId}"`,
      })
      .all();

    if (records.length === 0) {
      return false;
    }

    // Extract user fields and record ID
    const { id: recordId, fields: user } = records[0];
    const { password, ...userData } = user;
    return { ...userData, recordId };
  },

  // -------------------------------------------------------------------------------------------------------------------- //
  // DELETE USER PROFILE - [return object]
  deleteProfile: async (email) => {
    const records = await db(TABLES.users)
      .select({
        filterByFormula: `email = "${email}"`,
      })
      .all();

    if (records.length === 0) {
      throw new Error("User not found");
    }

    const recordId = records[0].id;
    const deletedRecord = await db(TABLES.users).destroy(recordId);

    return deletedRecord;
  },

  // -------------------------------------------------------------------------------------------------------------------- //
  // SAVE TOKEN FOR FORGOT PASSWORD PROCESS - [return string]
  saveTokenForForgotPassword: async (userId, resetToken, expirationDate, recordId) => {
    const records = await db(TABLES.users);
    await db(TABLES.reset_password).create([
      {
        fields: {
          token: resetToken,
          user_id: userId,
          expiration_date: expirationDate,
          record_id: recordId,
        },
      },
    ]);

    if (records.length === 0) {
      console.error(`[ERROR] saveTokenForForgotPassword: ${resetToken} not saved`);
    }
  },

  // -------------------------------------------------------------------------------------------------------------------- //
  // GET RESET PASSWORD TOKEN - [return objet]
  getResetToken: async (userId, token) => {
    const records = await db(TABLES.reset_password)
      .select({
        filterByFormula: `AND(user_id = "${userId}", token = "${token}")`,
      })
      .all();

    if (records.length === 0) {
      return null;
    }

    const record = records[0];
    return { reccordTokenId: record.id, ...record.fields };
  },

  // -------------------------------------------------------------------------------------------------------------------- //
  // SET USER DISCORD WEBHOOK - [return objet]
  setUserDiscordWebhook: async (discordWebhook, recordId) => {
    const updatedRecord = await db(TABLES.users).update(recordId, {
      discord_webhook: discordWebhook,
    });

    return updatedRecord;
  },
};

module.exports = userMethods;
