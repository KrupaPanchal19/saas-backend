const express = require("express");
const contact_us_admin = express.Router();

//middleware
const userAuth = require("../../middleware/passport/user_auth");
const companyAdminStaffAuth = require("../../middleware/company_auth/admin_staff_auth");

//controller
const {
  getAllContactUs,
  deleteContactUs,
} = require("../../controller/admin/contact_us_admin.controller");

contact_us_admin.get(
  "/admin/contact-us",
  userAuth,
  companyAdminStaffAuth,
  getAllContactUs
);

contact_us_admin.delete(
  "/admin/contact-us/:id",
  userAuth,
  companyAdminStaffAuth,
  deleteContactUs
);

module.exports = contact_us_admin;
