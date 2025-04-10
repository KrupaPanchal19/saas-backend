const express = require("express");
const setting_admin = express.Router();

//middleware
const userAuth = require("../../middleware/passport/user_auth");
const companyAdminStaffAuth = require("../../middleware/company_auth/admin_staff_auth");
const {
  addSetting,
  getSetting,
} = require("../../controller/admin/setting_admin.controller");

setting_admin.post(
  "/admin/setting",
  userAuth,
  companyAdminStaffAuth,
  addSetting
);

setting_admin.get(
  "/admin/setting",
  userAuth,
  companyAdminStaffAuth,
  getSetting
);

module.exports = setting_admin;
