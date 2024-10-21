// ========= IMPORTS ========= //
// npm
const methodOverride = require("method-override");

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

  customMethodOverride: methodOverride((req, res) => {
    if (req.body && typeof req.body === "object" && "_method" in req.body) {
      const method = req.body._method;
      delete req.body._method; // Supprime le champ _method du corps
      return method; // Retourne la méthode à utiliser
    }
  }),
};

module.exports = middlewares;
