const { check, validationResult } = require("express-validator");
const generalResponse = require("../../helper/general_response.helper");
const errorFilterValidator = require("../../helper/error_filter_validator.helper");

exports.serviceLocatorValidation = [
  check("zipcode").not().isEmpty().withMessage("Zipcode is required!!"),
  check("zipcode[*]")
    .not()
    .isEmpty()
    .matches(/(^\d{5}$)|(^\d{5}-\d{4}$)/)
    .withMessage("Zipcode data is not valid!!"),
  check("city").not().isEmpty().withMessage("City is required!!"),
  check("state").not().isEmpty().withMessage("State is required!!"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const message = errorFilterValidator(errors);
      return generalResponse(res, [], message, "error", true, 200);
    }
    next();
  },
];

exports.serviceLocatorValidationForZipCode = [
  check("search")
    .optional({ nullable: true, checkFalsy: true })
    .matches(/(^\d{5}$)|(^\d{5}-\d{4}$)/)
    .withMessage("Zipcode is not valid!!"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const message = errorFilterValidator(errors);
      return generalResponse(res, [], message, "error", true, 200);
    }
    next();
  },
];
