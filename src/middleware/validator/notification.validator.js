const { check, validationResult } = require("express-validator");
const generalResponse = require("../../helper/general_response.helper");
const errorFilterValidator = require("../../helper/error_filter_validator.helper");

exports.notificationValidation = [
  check("title").not().isEmpty().withMessage("Title is required!!"),
  check("message").not().isEmpty().withMessage("Message is required!!"),
  // check("customer").not().isEmpty().withMessage("Customer is required!!"),
  // check("driver").not().isEmpty().withMessage("Driver is required!!"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const message = errorFilterValidator(errors);
      return generalResponse(res, [], message, "error", true, 200);
    }
    next();
  },
];
