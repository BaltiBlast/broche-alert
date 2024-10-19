// ========= IMPORTS ========= //
// npm

// local

// ========= CONFIG ========= //

// ========= METHODS ========= //
const getAuthControllers = {
  // ---------------------------------------------------------------------------------------------------------------------------------- //
  // SIGNIN PAGE
  getSignin: (req, res) => {
    res.render("signin", { showNavbar: true });
  },

  getRegister: (req, res) => {
    res.render("register", { showNavbar: true });
  },
};

module.exports = getAuthControllers;
