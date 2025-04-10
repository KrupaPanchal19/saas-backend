const express = require("express");

const companyCustomerAuth = require("../../middleware/company_auth/customer_auth");
const userAuth = require("../../middleware/passport/user_auth");
const payment_customer = express.Router();

//middleware
const customerDeliveryAuth = require("../../middleware/delivery_auth/customer_delivery_auth");

//controller
const {
  stripePaymentMethodLists,
  stripeDeleteCard,
  deliveryChargeDeduct,
  deliveryCharge,
} = require("../../controller/customer/payment_customer.controller");
const {
  deliveryChargeValidation,
} = require("../../middleware/validator/delivery.validator");

payment_customer.get(
  "/customer/payment_method_list",
  userAuth,
  companyCustomerAuth,
  stripePaymentMethodLists
);

payment_customer.post(
  "/customer/delete_card",
  userAuth,
  companyCustomerAuth,
  stripeDeleteCard
);

payment_customer.post(
  "/customer/delivery_charge",
  userAuth,
  companyCustomerAuth,
  deliveryChargeValidation,
  customerDeliveryAuth,
  deliveryCharge
);

payment_customer.post(
  "/customer/delivery_charge_deduct",
  userAuth,
  companyCustomerAuth,
  customerDeliveryAuth,
  deliveryChargeDeduct
);

module.exports = payment_customer;
