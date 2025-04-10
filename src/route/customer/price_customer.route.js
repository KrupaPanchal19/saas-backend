const express = require("express");
const {
  getTotalPrice, calculationCharges,
} = require("../../controller/customer/price_customer.controller");
const companyCustomerAuth = require("../../middleware/company_auth/customer_auth");
const customerDeliveryAuth = require("../../middleware/delivery_auth/customer_delivery_auth");
const userAuth = require("../../middleware/passport/user_auth");
const price_customer = express.Router();

price_customer.post(
  "/customer/total_pricing",
  userAuth,
  companyCustomerAuth,
  customerDeliveryAuth,
  getTotalPrice
); 
price_customer.post(
  "/customer/delivery_calculation_charge",
  userAuth,
  companyCustomerAuth,
  calculationCharges
);

module.exports = price_customer;
