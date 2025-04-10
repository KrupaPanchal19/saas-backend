const express = require("express");
const service_locator_admin = express.Router();

//middleware
const userAuth = require("../../middleware/passport/user_auth");
const companyAdminStaffAuth = require("../../middleware/company_auth/admin_staff_auth");

//validator
const {
  serviceLocatorValidation,
} = require("../../middleware/validator/service_locator.validator");

//controller
const {
  addServiceLocator,
  editServiceLocator,
  getServiceLocators,
  getServiceLocator,
  deleteServiceLocator,
  findServices,
  findServiceMode,
  updateServiceMode,
} = require("../../controller/admin/service_locator_admin.controller");

service_locator_admin.get(
  "/admin/service-locator",
  userAuth,
  companyAdminStaffAuth,
  getServiceLocators
);
service_locator_admin.get(
  "/admin/service-locator/check",
  userAuth,
  companyAdminStaffAuth,
  findServices
);
service_locator_admin.get(
  "/admin/service-locator/mode",
  userAuth,
  companyAdminStaffAuth,
  findServiceMode
);
service_locator_admin.post(
  "/admin/service-locator/mode",
  userAuth,
  companyAdminStaffAuth,
  updateServiceMode
);
service_locator_admin.get(
  "/admin/service-locator/:id",
  userAuth,
  companyAdminStaffAuth,
  getServiceLocator
);
service_locator_admin.patch(
  "/admin/service-locator",
  userAuth,
  companyAdminStaffAuth,
  serviceLocatorValidation,
  editServiceLocator
);
service_locator_admin.delete(
  "/admin/service-locator/:id",
  userAuth,
  companyAdminStaffAuth,
  deleteServiceLocator
);
service_locator_admin.post(
  "/admin/service-locator",
  userAuth,
  companyAdminStaffAuth,
  serviceLocatorValidation,
  addServiceLocator
);

module.exports = service_locator_admin;
