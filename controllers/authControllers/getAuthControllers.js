// ========= IMPORTS ========= //
// npm

// local
const { SIGNIN, REGISTER } = require("../../utils/paths.js");

// ========= METHODS ========= //
const getAuthControllers = {
  // ---------------------------------------------------------------------------------------------------------------------------------- //
  // SIGNIN PAGE
  getSignin: (req, res) => {
    res.render("signin", { showNavbar: true, SIGNIN });
  },

  getRegister: (req, res) => {
    res.render("register", { showNavbar: true, REGISTER });
  },
};

module.exports = getAuthControllers;
