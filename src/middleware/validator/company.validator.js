const { check, validationResult } = require("express-validator");
const generalResponse = require("../../helper/general_response.helper");
const errorFilterValidator = require("../../helper/error_filter_validator.helper");

exports.createCompanyValidation = [
  check("name").not().isEmpty().withMessage("Company name is required"),
  check("short_name")
    .not()
    .isEmpty()
    .withMessage("Company short name is required"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const message = errorFilterValidator(errors);
      return generalResponse(res, [], message, "error", true, 200);
    }
    next();
  },
];

exports.updateCompanyValidation = [
  check("id").not().isEmpty().withMessage("Company id is required"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const message = errorFilterValidator(errors);
      return generalResponse(res, [], message, "error", true, 200);
    }
    next();
  },
];

exports.registerCompanyValidation = [
  check("name").not().isEmpty().withMessage("Company name is required"),
  check("short_name")
    .not()
    .isEmpty()
    .withMessage("Company short name is required"),
  check("role").not().isEmpty().withMessage("Company role is required"),
  check("admin_email")
    .not()
    .isEmpty()
    .withMessage("Company admin email is required"),
  check("admin_password")
    .not()
    .isEmpty()
    .withMessage("Company admin password is required"),
  check("admin_name")
    .not()
    .isEmpty()
    .withMessage("Company admin name is required"),
  check("admin_phone_number")
    .not()
    .isEmpty()
    .withMessage("Company admin phone number is required"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const message = errorFilterValidator(errors);
      return generalResponse(res, [], message, "error", true, 200);
    }
    next();
  },
];
