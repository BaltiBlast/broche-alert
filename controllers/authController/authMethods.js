// -------------------------------------------------------------------------------------------------------------------- //
// ===== IMPORTS ===== //
// local
const { db, TABLES } = require("../../services/airtable.js");
const { hashPassword, comparePassword } = require("../../utils/genericMethods.js");

const authMethods = {
  // -------------------------------------------------------------------------------------------------------------------- //
  // CHECK IF THE EMAIL EXISTS IN AIRTABLE - [return boolean]
  isEmailAlreadyExists: async (email) => {
    // 1. Try to find the email in Airtable
    const records = await db(TABLES.users)
      .select({
        filterByFormula: `email = "${email}"`,
      })
      .all();

    //2. If the email is found, return true
    if (records.length > 0) {
      return true;
    } else {
      return false;
    }
  },

  // -------------------------------------------------------------------------------------------------------------------- //
  // CREATE A NEW USER IN AIRTABLE
  createNewUser: async (objetUser) => {
    // 1. Destructure the object
    const { lastname, firstname, username, email, birthdate, password } = objetUser;

    // 2. Hash the password
    const hashedPassword = await hashPassword(password);

    // 3. Create the user in Airtable
    await db(TABLES.users).create([
      {
        fields: {
          email: email,
          last_name: lastname,
          first_name: firstname,
          username: username,
          birthdate: birthdate,
          password: hashedPassword,
        },
      },
    ]);
  },

  // -------------------------------------------------------------------------------------------------------------------- //
  // SIGNIN USER - [return objet]
  signinUser: async (loginCredentials) => {
    // 1. Destructure the object
    const { email, password } = loginCredentials;

    // 2. Get user data by the email
    const records = await db(TABLES.users)
      .select({
        filterByFormula: `email = "${email}"`,
      })
      .all();

    if (records.length === 0) {
      throw new Error("User not found");
    }

    // 3. Extract user fields and record ID
    const { id: recordId, fields: user } = records[0];

    // 4. Compare the password
    const isPasswordValid = await comparePassword(password, user.password);

    // 5. If the password is correct, return the user data without the password
    if (isPasswordValid) {
      const { password, ...userData } = user;
      return { ...userData, recordId: recordId }; // Add the record ID to userData
    } else {
      return false;
    }
  },
};

module.exports = authMethods;
