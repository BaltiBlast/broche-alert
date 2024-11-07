// -------------------------------------------------------------------------------------------------------------------- //
// ===== IMPORTS ===== //
// npm
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const genericMethods = {
  // -------------------------------------------------------------------------------------------------------------------- //
  // DATE FORMATER - [return date (EX : Saturday, November, 12:00 )]
  dateFormater: (date) => {
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const dayOfWeek = daysOfWeek[date.getDay()];
    const month = months[date.getMonth()];
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");

    return `${dayOfWeek}, ${month}, ${hours}:${minutes}`;
  },

  // -------------------------------------------------------------------------------------------------------------------- //
  // HASHING THE PASSWORD USING BCRYPT - [return string]
  hashPassword: async (password) => {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  },

  // -------------------------------------------------------------------------------------------------------------------- //
  // PASSWORD COMPARISON - [return boolean]
  comparePassword: async (password, hashedPassword) => {
    const isPasswordMatch = await bcrypt.compare(password, hashedPassword);
    return isPasswordMatch;
  },

  // -------------------------------------------------------------------------------------------------------------------- //
  // GENERATE RADOME TOKEN - [return string]
  generateRandomToken: () => {
    return crypto.randomBytes(32).toString("hex");
  },

  // -------------------------------------------------------------------------------------------------------------------- //
  // GENERATE EXPIRATION DATE - [return date]
  generateExpirationDate: (numberMinute) => {
    return new Date(Date.now() + numberMinute * 60 * 1000);
  },
};

module.exports = genericMethods;
