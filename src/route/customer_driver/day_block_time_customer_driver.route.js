const express = require("express");
const userAuth = require("../../middleware/passport/user_auth");
const companyCustomerDriverAuth = require("../../middleware/company_auth/customer_driver_auth");
const {
  getTiming,
} = require("../../controller/customer_driver/timing_customer_driver.controller");

const day_block_time_customer_driver = express.Router();

day_block_time_customer_driver.get(
  "/timing",
  userAuth,
  companyCustomerDriverAuth,
  getTiming
);

module.exports = day_block_time_customer_driver;
