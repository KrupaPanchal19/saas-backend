const express = require("express");
const userAuth = require("../../middleware/passport/user_auth");
const companyCustomerDriverAuth = require("../../middleware/company_auth/customer_driver_auth");
const {
  getCovidCms,
} = require("../../controller/customer_driver/covid_19_cms_customer_driver.controller");

const covid_19_cms_customer_driver = express.Router();

covid_19_cms_customer_driver.get(
  "/get_covid_cms",
  userAuth,
  companyCustomerDriverAuth,
  getCovidCms
);

module.exports = covid_19_cms_customer_driver;
