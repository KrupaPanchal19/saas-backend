const passport = require("passport");
const JWTstrategy = require("passport-jwt").Strategy;
const ExtractJWT = require("passport-jwt").ExtractJwt;
require("dotenv").config();

const { findUser } = require("../../repository/user.repository");

const opts = {
  jwtFromRequest: ExtractJWT.fromAuthHeaderWithScheme("JWT"),
  secretOrKey: process.env.SECRET_KEY,
};

passport.use(
  "jwt",
  new JWTstrategy(opts, (jwt_payload, done) => {
    try {
      let where = { email: jwt_payload.email };
      let attributes = ["id", "email", "name", "phone_number", "image_path"];
      findUser({ where, attributes }).then((user) => {
        if (user) {
          done(null, user);
        } else {
          done(null, false);
        }
      });
    } catch (err) {
      done(err);
    }
  })
);
