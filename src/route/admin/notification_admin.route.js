const express = require("express");
const notification_admin = express.Router();

//middleware
const userAuth = require("../../middleware/passport/user_auth");
const companyAdminStaffAuth = require("../../middleware/company_auth/admin_staff_auth");

//validation
const {
  notificationValidation,
} = require("../../middleware/validator/notification.validator");

//controller
const {
  addNotification,
  getNotifications,
  deleteNotification,
  resendMail,
} = require("../../controller/admin/notification_admin.controller");

notification_admin.get(
  "/admin/notification",
  userAuth,
  companyAdminStaffAuth,
  getNotifications
);
notification_admin.post(
  "/admin/notification",
  userAuth,
  companyAdminStaffAuth,
  notificationValidation,
  addNotification
);
notification_admin.delete(
  "/admin/notification/:id",
  userAuth,
  companyAdminStaffAuth,
  deleteNotification
);

notification_admin.get(
  "/admin/notification-mail/:id",
  userAuth,
  companyAdminStaffAuth,
  resendMail
);

module.exports = notification_admin;
