const express = require("express");
const userAuth = require("../../middleware/passport/user_auth");
const companyCustomerDriverAuth = require("../../middleware/company_auth/customer_driver_auth");
const {
  getCustomer,
} = require("../../controller/customer_driver/profile_customer_driver.controller");
const { emailCheck } = require("../../controller/authentication/authentication.controller");

const profile_customer_driver = express.Router();

profile_customer_driver.get(
  "/profile",
  userAuth,
  companyCustomerDriverAuth,
  getCustomer
);

profile_customer_driver.post(
  "/email_check",
  userAuth,
  companyCustomerDriverAuth,
  emailCheck
);

module.exports = profile_customer_driver;
