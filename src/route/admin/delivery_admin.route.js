const express = require("express");
const delivery_admin = express.Router();

//middleware
const userAuth = require("../../middleware/passport/user_auth");
const companyAdminStaffAuth = require("../../middleware/company_auth/admin_staff_auth");

//helper
const {
  createPaymentCustomer,
} = require("../../helper/create_customer.helper");

//validator
const {
  deliveryValidation,
  getDeliveryValidation,
  completedNoteValidation,
} = require("../../middleware/validator/delivery.validator");

//controller
const {
  findAllItemByStatus,
  addDelivery,
  getDelivery,
  getParticularDelivery,
  editDelivery,
  deleteDelivery,
  getParticularDeliveryView,
  declineDelivery,
  editDriverDelivery,
  manualPaymentAddData,
  getPoints,
  delivery_completed_notes,
  generatePaymentLink,
  calculateDeliveryCharges,
  findDeletedItems,
  resendDeliveryInfo,
} = require("../../controller/admin/delivery_admin.controller");

delivery_admin.get(
  "/admin/delivery/item",
  userAuth,
  companyAdminStaffAuth,
  findAllItemByStatus
);
delivery_admin.get(
  "/admin/delivery/deleted_items",
  userAuth,
  companyAdminStaffAuth,
  findDeletedItems
);

delivery_admin.post(
  "/admin/delivery",
  userAuth,
  companyAdminStaffAuth,
  deliveryValidation,
  createPaymentCustomer,
  addDelivery
);

delivery_admin.get(
  "/admin/delivery",
  userAuth,
  companyAdminStaffAuth,
  getDeliveryValidation,
  getDelivery
);

delivery_admin.get(
  "/admin/delivery/view/:id",
  userAuth,
  companyAdminStaffAuth,
  getParticularDeliveryView
);

delivery_admin.get(
  "/admin/delivery/:id",
  userAuth,
  companyAdminStaffAuth,
  getParticularDelivery
);

delivery_admin.patch(
  "/admin/delivery",
  userAuth,
  companyAdminStaffAuth,
  deliveryValidation,
  createPaymentCustomer,
  editDelivery
);

delivery_admin.delete(
  "/admin/delivery/:id",
  userAuth,
  companyAdminStaffAuth,
  deleteDelivery
);

delivery_admin.get(
  "/admin/delivery_resend",
  userAuth,
  companyAdminStaffAuth,
  resendDeliveryInfo
);

// decline delivery
delivery_admin.post(
  "/admin/delivery/decline",
  userAuth,
  companyAdminStaffAuth,
  declineDelivery
);

delivery_admin.patch(
  "/admin/delivery_driver",
  userAuth,
  companyAdminStaffAuth,
  editDriverDelivery
);

delivery_admin.post(
  "/admin/delivery_manual_payment",
  userAuth,
  companyAdminStaffAuth,
  manualPaymentAddData
);

// get pickup and destination point for live tracking
delivery_admin.get(
  "/admin/getpoints/:id",
  userAuth,
  companyAdminStaffAuth,
  getPoints
);

// complete delivery
delivery_admin.post(
  "/admin/delivery_completed_notes",
  userAuth,
  companyAdminStaffAuth,
  completedNoteValidation,
  delivery_completed_notes
);

//payment link
delivery_admin.get(
  "/admin/generate-payment-link/:id",
  userAuth,
  companyAdminStaffAuth,
  generatePaymentLink
);

//calculate delivery charge
delivery_admin.post(
  "/admin/delivery_calculation_charge",
  userAuth,
  companyAdminStaffAuth,
  calculateDeliveryCharges
);

module.exports = delivery_admin;
