const { check, validationResult } = require("express-validator");
const generalResponse = require("../../helper/general_response.helper");
const errorFilterValidator = require("../../helper/error_filter_validator.helper");

exports.driverValidation = [
  check("name").not().isEmpty().withMessage("Driver name is required!!"),
  check("car_info")
    .not()
    .isEmpty()
    .withMessage("One car information is necessary!!"),
  check("driver_cdl_licence")
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
