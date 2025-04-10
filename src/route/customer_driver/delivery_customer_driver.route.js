const express = require("express");
const userAuth = require("../../middleware/passport/user_auth");
const companyCustomerDriverAuth = require("../../middleware/company_auth/customer_driver_auth");
const {
  getDelivery,
  getPerticularDelivery,
} = require("../../controller/customer_driver/delivery_customer_driver.controller");
const {
  getPointOfLiveTracking,
} = require("../../controller/customer_driver/live_tracking_customer_driver.controller");
const {
  getAllDelivery,
  IdValidation,
} = require("../../middleware/validator/delivery.validator");

const delivery_customer_driver = express.Router();

delivery_customer_driver.get(
  "/delivery",
  userAuth,
  companyCustomerDriverAuth,
  getAllDelivery,
  getDelivery
);
delivery_customer_driver.get(
  "/delivery/:id",
  userAuth,
  companyCustomerDriverAuth,
  getPerticularDelivery
);
delivery_customer_driver.get(
  "/live_tracking_point",
  userAuth,
  companyCustomerDriverAuth,
  IdValidation,
  getPointOfLiveTracking
);

module.exports = delivery_customer_driver;
