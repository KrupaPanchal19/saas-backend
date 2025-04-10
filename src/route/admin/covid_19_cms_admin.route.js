const express = require("express");
const covid_19_cms_admin = express.Router();

//middleware
const userAuth = require("../../middleware/passport/user_auth");
const companyAdminStaffAuth = require("../../middleware/company_auth/admin_staff_auth");

//controller
const {
  insertCovidCms,
  getCovidCms,
} = require("../../controller/admin/covid_19_cms_admin.controller");

covid_19_cms_admin.get(
  "/admin/covid-19",
  userAuth,
  companyAdminStaffAuth,
  getCovidCms
);

covid_19_cms_admin.post(
  "/admin/covid-19",
  userAuth,
  companyAdminStaffAuth,
  insertCovidCms
);

module.exports = covid_19_cms_admin;
