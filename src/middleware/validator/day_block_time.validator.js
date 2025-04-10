const { check, validationResult } = require("express-validator");
const generalResponse = require("../../helper/general_response.helper");
const errorFilterValidator = require("../../helper/error_filter_validator.helper");

exports.dayBlockTimeValidation = [
  check("from")
    .not()
    .isEmpty()
    .withMessage("From time is required!!")
    .matches(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/, "From time is not valid"),
  check("to")
    .not()
    .isEmpty()
    .withMessage("To time is required!!")
    .matches(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/, "From time is not valid"),
  check("days").not().isEmpty().withMessage("Day is required"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const message = errorFilterValidator(errors);
      return generalResponse(res, [], message, "error", true, 200);
    }
    next();
  },
];
