const express = require("express");
const day_block_time_admin = express.Router();

//middleware
const userAuth = require("../../middleware/passport/user_auth");
const companyAdminStaffAuth = require("../../middleware/company_auth/admin_staff_auth");

//validator
const {
  dayBlockTimeValidation,
} = require("../../middleware/validator/day_block_time.validator");

// controller
const {
  addTiming,
  getAllTiming,
  deleteTiming,
  getAllTimingsForCalender,
} = require("../../controller/admin/timing_admin.controller");

day_block_time_admin.get(
  "/admin/timing/calendar",
  userAuth,
  companyAdminStaffAuth,
  getAllTimingsForCalender
);

day_block_time_admin.post(
  "/admin/timing",
  userAuth,
  companyAdminStaffAuth,
  dayBlockTimeValidation,
  addTiming
);
day_block_time_admin.delete(
  "/admin/timing/:id",
  userAuth,
  companyAdminStaffAuth,
  deleteTiming
);

//for delivery
day_block_time_admin.get(
  "/admin/timings",
  userAuth,
  companyAdminStaffAuth,
  getAllTiming
);

module.exports = day_block_time_admin;
