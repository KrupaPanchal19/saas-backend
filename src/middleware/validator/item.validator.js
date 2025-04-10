const { check, validationResult } = require("express-validator");
const generalResponse = require("../../helper/general_response.helper");
const errorFilterValidator = require("../../helper/error_filter_validator.helper");

exports.ItemValidation = [
  check("item_name").not().isEmpty().withMessage("item name is required"),
  check("status").not().isEmpty().withMessage("item status is required"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const message = errorFilterValidator(errors);
      return generalResponse(res, [], message, "error", true, 200);
    }
    next();
  },
];
