const express = require("express");
const {
  addDelivery,
  deleteDelivery,
  deliveryReview,
  declineDelivery,
} = require("../../controller/customer/delivery_customer.controller");
const {
  createPaymentCustomer,
} = require("../../helper/create_customer.helper");
const companyCustomerAuth = require("../../middleware/company_auth/customer_auth");
const customerDeliveryAuth = require("../../middleware/delivery_auth/customer_delivery_auth");
const userAuth = require("../../middleware/passport/user_auth");
const { customerDeliveryValidation, reviewValidation } = require("../../middleware/validator/delivery.validator");
const delivery_customer = express.Router();

delivery_customer.post(
  "/customer/delivery",
  userAuth,
  companyCustomerAuth,
  createPaymentCustomer,
  customerDeliveryValidation,
  addDelivery
);
delivery_customer.delete(
  "/customer/delivery/:id",
  userAuth,
  companyCustomerAuth,
  deleteDelivery
);

delivery_customer.post(
  "/customer/review",
  userAuth,
  companyCustomerAuth,
  reviewValidation,
  deliveryReview
);

delivery_customer.post(
  "/customer/delivery_decline",
  userAuth,
  companyCustomerAuth,
  customerDeliveryAuth,
  declineDelivery
);

module.exports = delivery_customer;
