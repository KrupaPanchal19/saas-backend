const express = require("express");
const role = express.Router();

//middleware
const {
  createRoleValidation,
} = require("../../middleware/validator/role.validator");

//controller
const {
  getAllRoles,
  createRole,
  deleteRole,
} = require("../../controller/role/role.controller");

role.get("/roles", getAllRoles);
role.post("/role", createRoleValidation, createRole);
role.delete("/role/:id", deleteRole);

module.exports = role;
