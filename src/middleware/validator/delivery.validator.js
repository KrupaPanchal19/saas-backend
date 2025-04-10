const { check, validationResult } = require("express-validator");
const generalResponse = require("../../helper/general_response.helper");
const errorFilterValidator = require("../../helper/error_filter_validator.helper");

exports.deliveryValidation = [
  check("pickup_location")
    .not()
    .isEmpty()
    .withMessage("Pick-up location is required!!"),
  check("destination_location")
    .not()
    .isEmpty()
    .withMessage("Destination location is required!!"),
  check("destination_type")
    .not()
    .isEmpty()
    .withMessage("Destination type is required!!"),
  check("expected_delivery_time")
    .not()
    .isEmpty()
    .withMessage("Pick-up time is required!!"),
  check("item").not().isEmpty().withMessage("One item is necessary!!"),
  check("pickup_latitude")
    .not()
    .isEmpty()
    .withMessage("Pick-up latitude is required!!")
    .custom(async (value) => {
      if (value === "undefined") {
        throw new Error("Please select the Pickup location");
      }
    }),
  check("pickup_longitude")
    .not()
    .isEmpty()
    .withMessage("Pick-up longitude is required!!"),

  check("destination_latitude")
    .not()
    .isEmpty()
    .withMessage("Destination latitude is required!!")
    .custom(async (value) => {
      if (value === "undefined") {
        throw new Error("Please select the Destination location");
      }
    }),
  check("destination_longitude")
    .not()
    .isEmpty()
    .withMessage("Destination longitude is required!!"),

  check("user_id").not().isEmpty().withMessage("Customer is required!!"),
  (req, res, next) => {
    const errors = validationResult(req);
    let itemError = false;
    if (req.body.item) {
      const item = JSON.parse(req.body.item);
      if (item.length > 0) {
        itemError = !item.every(
          (singleItem) => singleItem.id && singleItem.item_quantity
        );
      } else {
        itemError = true;
      }
    }

    if (!errors.isEmpty()) {
      const message = errorFilterValidator(errors);
      return generalResponse(res, [], message, "error", true, 200);
    } else if (itemError) {
      return generalResponse(
        res,
        [],
        "Item data is required!!",
        "error",
        true,
        200
      );
    }
    next();
  },
];

exports.getDeliveryValidation = [
  check("deliveryType")
    .isIn(["REQUESTED", "ASSIGNED", "UPCOMING", "COMPLETE", "DECLINE", "ALL"])
    .withMessage("Delivery Type is not valid!!"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const message = errorFilterValidator(errors);
      return generalResponse(res, [], message, "error", true, 200);
    }
    next();
  },
];

exports.completedNoteValidation = [
  check("status")
    .not()
    .isEmpty()
    .isIn(["COMPLETED"])
    .withMessage("Status is required"),
  check("delivery_id").not().isEmpty().withMessage("Id is required"),
  check("comment").not().isEmpty().withMessage("Comment is required"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const message = errorFilterValidator(errors);
      return generalResponse(res, [], message, "error", true, 200);
    }
    next();
  },
];

exports.getAllDelivery = [
  check("current_time")
    .not()
    .isEmpty()
    .withMessage("Current Time is required!!"),
  check("page").not().isEmpty().withMessage("Page Number is required!!"),
  check("status")
    .isIn([
      "upcoming_pickup",
      "account_history",
      "my_pickup_schedule",
      "job_history",
    ])
    .withMessage("Status is not valid!!"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const message = errorFilterValidator(errors);
      return generalResponse(res, [], message, "error", true, 200);
    }
    next();
  },
];

exports.customerDeliveryValidation = [
  check("pickup_location")
    .not()
    .isEmpty()
    .withMessage("Pick-up location is required!!"),
  check("destination_location")
    .not()
    .isEmpty()
    .withMessage("Destination location is required!!"),
  check("destination_type")
    .not()
    .isEmpty()
    .withMessage("Destination type is required!!"),
  check("expected_delivery_time")
    .not()
    .isEmpty()
    .withMessage("Pick-up time is required!!"),
  check("item").not().isEmpty().withMessage("One item is necessary!!"),
  check("pickup_latitude")
    .not()
    .isEmpty()
    .withMessage("Pick-up latitude is required!!"),
  check("pickup_longitude")
    .not()
    .isEmpty()
    .withMessage("Pick-up longitude is required!!"),
  check("destination_latitude")
    .not()
    .isEmpty()
    .withMessage("Destination latitude is required!!"),
  check("destination_longitude")
    .not()
    .isEmpty()
    .withMessage("Destination longitude is required!!"),
  (req, res, next) => {
    const errors = validationResult(req);
    let itemError = false;
    if (req.body.item) {
      const item = JSON.parse(req.body.item);
      if (item.length > 0) {
        itemError = !item.every(
          (singleItem) => singleItem.id && singleItem.item_quantity
        );
      } else {
        itemError = true;
      }
    }

    if (!errors.isEmpty()) {
      const message = errorFilterValidator(errors);
      return generalResponse(res, [], message, "error", true, 200);
    } else if (itemError) {
      return generalResponse(
        res,
        [],
        "Item data is required!!",
        "error",
        true,
        200
      );
    }
    next();
  },
];

exports.reviewValidation = [
  check("delivery_id").not().isEmpty().withMessage("Delivery id is required!!"),
  check("rate").not().isEmpty().withMessage("Rate id is required!!"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const message = errorFilterValidator(errors);
      return generalResponse(res, [], message, "error", true, 200);
    }
    next();
  },
];

exports.deliveryChargeValidation = [
  check("delivery_id").not().isEmpty().withMessage("Delivery id is required!!"),
  check("total_price").not().isEmpty().withMessage("Total price is required!!"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const message = errorFilterValidator(errors);
      return generalResponse(res, [], message, "error", true, 200);
    }
    next();
  },
];

exports.driverCompletedNoteValidation = [
  check("status")
    .not()
    .isEmpty()
    .isIn(["COMPLETED"])
    .withMessage("Status is required"),
  check("delivery_id").not().isEmpty().withMessage("Id is required"),
  check("comment").not().isEmpty().withMessage("Comment is required"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const message = errorFilterValidator(errors);
      return generalResponse(res, [], message, "error", true, 200);
    }
    next();
  },
];

exports.driverPickUpNoteValidation = [
  check("status")
    .not()
    .isEmpty()
    .isIn(["PICKEDUP"])
    .withMessage("Status is required"),
  check("delivery_id").not().isEmpty().withMessage("Id is required"),
  check("pickup_status")
    .not()
    .isEmpty()
    .withMessage("Pick-up Status is required"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const message = errorFilterValidator(errors);
      return generalResponse(res, [], message, "error", true, 200);
    }
    next();
  },
];

exports.liveLocationValidation = [
  check("delivery_id")
    .not()
    .isEmpty()
    .withMessage("Delivery id is required")
    .isNumeric()
    .withMessage("Only Decimals allowed"),
  check("latitude").not().isEmpty().withMessage("Live latitude is required"),
  check("longitude").not().isEmpty().withMessage("Live latitude is required"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const message = errorFilterValidator(errors);
      return generalResponse(res, [], message, "error", true, 200);
    }
    next();
  },
];

exports.IdValidation = [
  check("id")
    .not()
    .isEmpty()
    .withMessage("Delivery id is required")
    .isNumeric()
    .withMessage("Only Decimals allowed"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const message = errorFilterValidator(errors);
      return generalResponse(res, [], message, "error", true, 200);
    }
    next();
  },
];
