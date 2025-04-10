const passport = require("passport");
const generalResponse = require("../../helper/general_response.helper");

const userAuth = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return generalResponse(
        res,
        [],
        "Your token has expired!!",
        "error",
        true,
        401
      );
    } else {
      req.user = user;
      return next();
    }
  })(req, res, next);
};

module.exports = userAuth;
