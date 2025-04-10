const express = require("express");
const userAuth = require("../../middleware/passport/user_auth");
const companyCustomerDriverAuth = require("../../middleware/company_auth/customer_driver_auth");
const {
  getsHolidays,
} = require("../../controller/customer_driver/holidays_customer_driver.controller");

const holidays_customer_driver = express.Router();

holidays_customer_driver.get(
  "/holidays",
  userAuth,
  companyCustomerDriverAuth,
  getsHolidays
);

module.exports = holidays_customer_driver;
