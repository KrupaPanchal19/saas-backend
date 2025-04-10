const express = require("express");
const staff_admin = express.Router();

//middleware
const userAuth = require("../../middleware/passport/user_auth");
const companyAdminStaffAuth = require("../../middleware/company_auth/admin_staff_auth");
const {
  createUserValidation,
} = require("../../middleware/validator/user.validator");

//controller
const {
  getAllStaff,
  createStaff,
  getStaff,
  deleteStaff,
} = require("../../controller/admin/staff_admin.controller");

staff_admin.get("/admin/staff", userAuth, companyAdminStaffAuth, getAllStaff);
staff_admin.get("/admin/staff/:id", userAuth, companyAdminStaffAuth, getStaff);
staff_admin.post(
  "/admin/staff",
  userAuth,
  companyAdminStaffAuth,
  // createUserValidation,
  createStaff
);
staff_admin.delete(
  "/admin/staff/:id",
  userAuth,
  companyAdminStaffAuth,
  deleteStaff
);
module.exports = staff_admin;
