const { check, validationResult } = require("express-validator");
const { findUser } = require("../../repository/user.repository");
const generalResponse = require("../../helper/general_response.helper");
const errorFilterValidator = require("../../helper/error_filter_validator.helper");

exports.loginValidation = [
  check("email")
    .not()
    .isEmpty()
    .withMessage("Email is required!!")
    .isEmail()
    .withMessage("Must be a valid email address!!")
    .custom(async (value) => {
      let where = { email: value };
      const user = await findUser({ where });
      if (!user) {
        throw new Error("Please Register First!!");
      }
    }),
  check("password").not().isEmpty().withMessage("Password is required!!"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const message = errorFilterValidator(errors);
      return generalResponse(res, [], message, "error", true, 200);
    }
    next();
  },
];
exports.otpValidation = [
  check("phone_number")
    .not()
    .isEmpty()
    .withMessage("Phone number is required!!")
    .matches(/((^|, )(^(\+)91\d{10}$|^(\+1)\d{10}$))+$/)
    .withMessage("Please enter valid phone number!!"),

  check("type").not().isEmpty().withMessage("Type is required"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const message = errorFilterValidator(errors);
      return generalResponse(res, [], message, "error", true, 200);
    }
    next();
  },
];
exports.registerValidation = [
  check("name").not().isEmpty().withMessage("Name is required!!"),
  check("password")
    .not()
    .isEmpty()
    .withMessage("Password is required!!")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/)
    .withMessage(
      "Password must contain a number,uppercase,special character,lowercase!!"
    ),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const message = errorFilterValidator(errors);
      return generalResponse(res, [], message, "error", true, 200);
    }
    next();
  },
];
