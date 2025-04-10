const express = require("express");
const userAuth = require("../../middleware/passport/user_auth");
const companyCustomerDriverAuth = require("../../middleware/company_auth/customer_driver_auth");
const {
  addContactUs,
  getContactUs,
} = require("../../controller/customer_driver/contactus_customer_driver.controller");

const contact_us_customer_driver = express.Router();

contact_us_customer_driver.get(
  "/contact_us",
  userAuth,
  companyCustomerDriverAuth,
  getContactUs
);
contact_us_customer_driver.post(
  "/contact_us",
  userAuth,
  companyCustomerDriverAuth,
  addContactUs
);

module.exports = contact_us_customer_driver;
