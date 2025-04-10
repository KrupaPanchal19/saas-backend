const express = require("express");
const userAuth = require("../../middleware/passport/user_auth");

const payment = express.Router();

const companyAllAuth = require("../../middleware/company_auth/all_auth");
const paymentTokenAuth = require("../../middleware/token_auth/payment_token_auth");

const { createSellerAccount } = require("../../stripe/addStripeAccount");
const { linkSellerAccount } = require("../../stripe/accountLink");
const {
  getPaymentInfo,
} = require("../../controller/payment/payment.controller");

payment.post(
  "/payment/create-account",
  userAuth,
  companyAllAuth,
  createSellerAccount
);

payment.post(
  "/payment/link-account",
  userAuth,
  companyAllAuth,
  linkSellerAccount
);

payment.get("/delivery-payment-data", paymentTokenAuth, getPaymentInfo);

module.exports = payment;
