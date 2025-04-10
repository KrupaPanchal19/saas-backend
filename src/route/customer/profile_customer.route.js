const express = require("express");
const {
  updateCustomer,
} = require("../../controller/customer/profile_customer.controller");
const companyCustomerAuth = require("../../middleware/company_auth/customer_auth");
const userAuth = require("../../middleware/passport/user_auth");
const profile_customer = express.Router();

profile_customer.patch(
  "/customer/profile",
  userAuth,
  companyCustomerAuth,
  updateCustomer
);

module.exports = profile_customer;
