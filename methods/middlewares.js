// ========= IMPORTS ========= //
// local
const paths = require("../utils/paths.js");

const middlewares = {
  isUserAuthenticated: (req, res, next) => {
    if (req.session.user) {
      next();
    } else {
      res.redirect("/signin");
    }
  },

  setUserDataGlobal(req, res, next) {
    if (req.session.user) {
      res.locals.user = req.session.user;
    } else {
      res.locals.user = null;
    }
    next();
  },

  setGlobalRoutes(req, res, next) {
    res.locals.paths = { ...paths };
    next();
  },
};

module.exports = middlewares;
