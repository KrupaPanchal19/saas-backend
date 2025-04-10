const express = require("express");
const {
  findAllItem,
} = require("../../controller/customer/item_customer.controller");
const companyCustomerAuth = require("../../middleware/company_auth/customer_auth");
const userAuth = require("../../middleware/passport/user_auth");
const item_customer = express.Router();

//controller
item_customer.get("/customer/item", userAuth, companyCustomerAuth, findAllItem);

module.exports = item_customer;
