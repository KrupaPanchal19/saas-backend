const express = require("express");
const {
  findAllServices,
  findServices,
  findServiceMode,
} = require("../../controller/customer/servicelocator_customer.controller");
const companyCustomerAuth = require("../../middleware/company_auth/customer_auth");
const userAuth = require("../../middleware/passport/user_auth");
const {
  serviceLocatorValidationForZipCode,
} = require("../../middleware/validator/service_locator.validator");
const service_locator_customer = express.Router();

//servicelocator
service_locator_customer.get(
  "/customer/servicelocator",
  userAuth,
  companyCustomerAuth,
  findAllServices
);
service_locator_customer.get(
  "/customer/servicelocator/check",
  userAuth,
  companyCustomerAuth,
  serviceLocatorValidationForZipCode,
  findServices
);

service_locator_customer.get(
  "/customer/servicelocator/mode",
  userAuth,
  companyCustomerAuth,
  findServiceMode
);

module.exports = service_locator_customer;
