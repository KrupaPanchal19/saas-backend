const { check, validationResult } = require("express-validator");
const generalResponse = require("../../helper/general_response.helper");
const errorFilterValidator = require("../../helper/error_filter_validator.helper");

exports.createUserValidation = [
  check("name").not().isEmpty().withMessage("name is required"),
  check("email").not().isEmpty().withMessage("email is required"),
  check("password").not().isEmpty().withMessage("password is required"),
  check("phone_number").not().isEmpty().withMessage("phone number is required"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const message = errorFilterValidator(errors);
      return generalResponse(res, [], message, "error", true, 200);
    }
    next();
  },
];

exports.updateUserValidation = [
  check("id").not().isEmpty().withMessage("user id is required"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const message = errorFilterValidator(errors);
      return generalResponse(res, [], message, "error", true, 200);
    }
    next();
  },
];

exports.driverValidation = [
  check("car_info")
    .not()
    .isEmpty()
    .withMessage("One car information is necessary!!"),
  check("driver_cdl_license")
    .not()
    .isEmpty()
    .withMessage("Commercial driver's license is required!!"),

  (req, res, next) => {
    let carDataError = false;
    if (req.body.car_info) {
      const carData = JSON.parse(req.body.car_info);
      if (carData.length > 0) {
        carDataError = !carData.every(
          (d) => d.car_type && d.car_color && d.car_model
        );
      } else {
        carDataError = true;
      }
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const message = errorFilterValidator(errors);
      return generalResponse(res, [], message, "error", true, 200);
    } else if (carDataError) {
      return generalResponse(
        res,
        [],
        "Car information is required!!",
        "error",
        true,
        200
      );
    }
    next();
  },
];

exports.customerValidation = [
  check("id").not().isEmpty().withMessage("id is required!!"),
  check("status").not().isEmpty().withMessage("Status is required!!"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const message = errorFilterValidator(errors);
      return generalResponse(res, [], message, "error", true, 200);
    }
    next();
  },
];

exports.userStatusValidation = [
  check("status")
    .not()
    .isEmpty()
    .isIn(["ACTIVE", "INACTIVE"])
    .withMessage("Status is required!!"),
  check("id").not().isEmpty().withMessage("Id is required!!"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const message = errorFilterValidator(errors);
      return generalResponse(res, [], message, "error", true, 200);
    }
    next();
  },
];
