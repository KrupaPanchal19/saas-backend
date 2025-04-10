const express = require("express");
const driver_admin = express.Router();

//middleware
const userAuth = require("../../middleware/passport/user_auth");
const companyAdminStaffAuth = require("../../middleware/company_auth/admin_staff_auth");
const {
  createUserValidation,
  driverValidation,
  userStatusValidation,
} = require("../../middleware/validator/user.validator");

//controller
const {
  getAllDriver,
  createDriver,
  getDriver,
  getAllDriverCombo,
  editDriver,
  driverViewReview,
  driverViewAssigned,
  driverViewCompleted,
  driverViewUpcoming,
  deleteDriver,
} = require("../../controller/admin/driver_admin.controller");
const { editUserStatus } = require("../../controller/admin/user_admin.controller");

driver_admin.get(
  "/admin/driver",
  userAuth,
  companyAdminStaffAuth,
  getAllDriver
);
driver_admin.get(
  "/admin/driver/:id",
  userAuth,
  companyAdminStaffAuth,
  getDriver
);
driver_admin.post(
  "/admin/driver",
  userAuth,
  companyAdminStaffAuth,
  // createUserValidation,
  // driverValidation,
  createDriver
);

driver_admin.patch(
  "/admin/driver",
  userAuth,
  companyAdminStaffAuth,
  driverValidation,
  editDriver
);

driver_admin.get(
  "/admin/driver-combo",
  userAuth,
  companyAdminStaffAuth,
  getAllDriverCombo
);

///driver status

driver_admin.patch(
  "/admin/driver_status",
  userAuth,
  companyAdminStaffAuth,
  userStatusValidation,
  editUserStatus
);

///driver view

driver_admin.get(
  "/admin/driver/view/review",
  userAuth,
  companyAdminStaffAuth,
  driverViewReview
);

driver_admin.get(
  "/admin/driver/view/assigned",
  userAuth,
  companyAdminStaffAuth,
  driverViewAssigned
);

driver_admin.get(
  "/admin/driver/view/completed",
  userAuth,
  companyAdminStaffAuth,
  driverViewCompleted
);

driver_admin.get(
  "/admin/driver/view/upcoming",
  userAuth,
  companyAdminStaffAuth,
  driverViewUpcoming
);

///delete driver

driver_admin.delete(
  "/admin/driver/:id",
  userAuth,
  companyAdminStaffAuth,
  deleteDriver
);

module.exports = driver_admin;
