const express = require("express");
const userAuth = require("../../middleware/passport/user_auth");
const companyCustomerDriverAuth = require("../../middleware/company_auth/customer_driver_auth");
const {
  removeNotificationToken,
  setNotificationToken,
} = require("../../controller/customer_driver/notification_token_customer_driver.controller");

const notification_token_customer_driver = express.Router();

notification_token_customer_driver.post(
  "/add_notification_token",
  userAuth,
  companyCustomerDriverAuth,
  setNotificationToken
);

notification_token_customer_driver.post(
  "/remove_notification_token",
  userAuth,
  companyCustomerDriverAuth,
  removeNotificationToken
);

module.exports = notification_token_customer_driver;
