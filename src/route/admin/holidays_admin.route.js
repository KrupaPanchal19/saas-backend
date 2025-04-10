const express = require("express");
const holidays_admin = express.Router();

//middleware
const userAuth = require("../../middleware/passport/user_auth");
const companyAdminStaffAuth = require("../../middleware/company_auth/admin_staff_auth");

//validator
const {
  holidaysValidation,
} = require("../../middleware/validator/holidays.validator");

// controller
const {
  addHolidays,
  editHolidays,
  getHolidays,
  getAllHolidays,
  deleteHolidays,
  getAllHolidaysForCalender,
} = require("../../controller/admin/holidays_admin.controller");

holidays_admin.get(
  "/admin/holidays/block",
  userAuth,
  companyAdminStaffAuth,
  getAllHolidays
);
holidays_admin.get(
  "/admin/holidays/calendar",
  userAuth,
  companyAdminStaffAuth,
  getAllHolidaysForCalender
);
holidays_admin.get(
  "/admin/holidays/:id",
  userAuth,
  companyAdminStaffAuth,
  getHolidays
);
holidays_admin.patch(
  "/admin/holidays",
  holidaysValidation,
  userAuth,
  companyAdminStaffAuth,
  editHolidays
);
holidays_admin.delete(
  "/admin/holidays/:id",
  userAuth,
  companyAdminStaffAuth,
  deleteHolidays
);
holidays_admin.post(
  "/admin/holidays",
  holidaysValidation,
  userAuth,
  companyAdminStaffAuth,
  addHolidays
);

module.exports = holidays_admin;
