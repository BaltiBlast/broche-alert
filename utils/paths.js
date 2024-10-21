const routes = {
  HOME: { path: "/", text: "Broche Tools" },
  SIGNIN: { path: "/signin", text: "signin" },
  REGISTER: { path: "/register", text: "register" },
  LOGOUT: { path: "/logout", text: "logout" },
  LIVE_ALERTS: { path: "/live-alerts", text: "alerts" },
  ABOUT: { path: "/about", text: "about" },
  DELETE_SUBSCRIPTION: { path: "/unsubscribe/:username", text: "delete" },
};

module.exports = routes;
