const getAuthControllers = {
  getSignin: (req, res) => {
    res.render("signin");
  },
};

module.exports = getAuthControllers;
