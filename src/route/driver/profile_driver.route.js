const express = require("express");
const userAuth = require("../../middleware/passport/user_auth");
const companyDriverAuth = require("../../middleware/company_auth/driver_auth");
const {
  driverValidation,
} = require("../../middleware/validator/driver.validator");
const {
  editDriver,
} = require("../../controller/driver/profile_driver.controller");

const profile_driver = express.Router();

profile_driver.patch(
  "/driver/profile",
  userAuth,
  companyDriverAuth,
  driverValidation,
  editDriver
);

module.exports = profile_driver;
