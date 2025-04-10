const express = require("express");
const price_admin = express.Router();

//middleware
const userAuth = require("../../middleware/passport/user_auth");
const companyAdminStaffAuth = require("../../middleware/company_auth/admin_staff_auth");

//controller
const {
  updatePricing,
  getPricing,
} = require("../../controller/admin/pricing_admin.controller");

price_admin.get("/admin/pricing", userAuth, companyAdminStaffAuth, getPricing);
price_admin.patch(
  "/admin/pricing",
  userAuth,
  companyAdminStaffAuth,
  updatePricing
);

module.exports = price_admin;
