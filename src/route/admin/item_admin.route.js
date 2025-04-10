const express = require("express");
const item_admin = express.Router();

//middleware
const userAuth = require("../../middleware/passport/user_auth");
const companyAdminStaffAuth = require("../../middleware/company_auth/admin_staff_auth");
const { ItemValidation } = require("../../middleware/validator/item.validator");

//controller
const {
  getAllItems,
  getItem,
  createItem,
  updateItem,
  deleteItem,
} = require("../../controller/admin/item_admin.controller");

item_admin.get("/admin/item", userAuth, companyAdminStaffAuth, getAllItems);
item_admin.get("/admin/item/:id", userAuth, companyAdminStaffAuth, getItem);
item_admin.post(
  "/admin/item",
  ItemValidation,
  userAuth,
  companyAdminStaffAuth,
  createItem
);
item_admin.patch(
  "/admin/item",
  ItemValidation,
  userAuth,
  companyAdminStaffAuth,
  updateItem
);
item_admin.delete(
  "/admin/item/:id",
  userAuth,
  companyAdminStaffAuth,
  deleteItem
);

module.exports = item_admin;
