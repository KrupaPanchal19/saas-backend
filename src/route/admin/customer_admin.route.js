const express = require("express");
const customer_admin = express.Router();

//middleware
const userAuth = require("../../middleware/passport/user_auth");
const companyAdminStaffAuth = require("../../middleware/company_auth/admin_staff_auth");

//controller
const {
  getAllCustomer,
  getCustomer,
  createCustomer,
  getAllCustomerCombo,
  customerViewAssigned,
  customerViewCompleted,
  customerViewRequested,
  customerViewReview,
  customerViewUpcoming,
  deleteCustomer,
  updateCustomer,
} = require("../../controller/admin/customer_admin.controller");
const {
  customerValidation, userStatusValidation,
} = require("../../middleware/validator/user.validator");
const { editUserStatus } = require("../../controller/admin/user_admin.controller");

customer_admin.get(
  "/admin/customer",
  userAuth,
  companyAdminStaffAuth,
  getAllCustomer
);
customer_admin.get(
  "/admin/customer/:id",
  userAuth,
  companyAdminStaffAuth,
  getCustomer
);
customer_admin.post(
  "/admin/customer",
  userAuth,
  companyAdminStaffAuth,
  createCustomer
);
customer_admin.get(
  "/admin/customer-combo",
  userAuth,
  companyAdminStaffAuth,
  getAllCustomerCombo
);

///view customer

customer_admin.get(
  "/admin/customer/view/assigned",
  userAuth,
  companyAdminStaffAuth,
  customerViewAssigned
);

customer_admin.get(
  "/admin/customer/view/completed",
  userAuth,
  companyAdminStaffAuth,
  customerViewCompleted
);

customer_admin.get(
  "/admin/customer/view/requested",
  userAuth,
  companyAdminStaffAuth,
  customerViewRequested
);

customer_admin.get(
  "/admin/customer/view/review",
  userAuth,
  companyAdminStaffAuth,
  customerViewReview
);

customer_admin.get(
  "/admin/customer/view/upcoming",
  userAuth,
  companyAdminStaffAuth,
  customerViewUpcoming
);

customer_admin.patch(
  "/admin/customer",
  userAuth,
  companyAdminStaffAuth,
  customerValidation,
  updateCustomer
);

customer_admin.patch(
  "/admin/customer_status",
  userAuth,
  companyAdminStaffAuth,
  userStatusValidation,
  editUserStatus
);

///delete customer

customer_admin.delete(
  "/admin/customer/:id",
  userAuth,
  companyAdminStaffAuth,
  deleteCustomer
);

module.exports = customer_admin;
