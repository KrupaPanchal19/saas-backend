const express = require("express");
const userAuth = require("../../middleware/passport/user_auth");
const companyDriverAuth = require("../../middleware/company_auth/driver_auth");
const {
  add_live_location,
} = require("../../controller/driver/live_tracking_driver.controller");
const {
  pickup_delivery_notes,
} = require("../../controller/driver/pickup_delivery_notes_driver.controller");
const {
  delivery_completed_notes,
} = require("../../controller/driver/delivery_completed_notes_driver.controller");
const {
  driverCompletedNoteValidation,
  driverPickUpNoteValidation,
  liveLocationValidation,
} = require("../../middleware/validator/delivery.validator");

const delivery_driver = express.Router();

delivery_driver.post(
  "/driver/live_point",
  userAuth,
  companyDriverAuth,
  liveLocationValidation,
  add_live_location
);

delivery_driver.post(
  "/driver/pickup_delivery_notes",
  userAuth,
  companyDriverAuth,
  driverPickUpNoteValidation,
  pickup_delivery_notes
);

delivery_driver.post(
  "/driver/delivery_completed_notes",
  userAuth,
  companyDriverAuth,
  driverCompletedNoteValidation,
  delivery_completed_notes
);

module.exports = delivery_driver;
