const express = require("express");
const user = express.Router();

//middleware
const userAuth = require("../../middleware/passport/user_auth");
const {
  createUserValidation,
  updateUserValidation,
} = require("../../middleware/validator/user.validator");

//controller
const {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getUserCompany,
  getCurrentUser,
  getCompanyStripeLink,
  registerUser,
} = require("../../controller/user/user.controller");

user.get("/user-company-list", userAuth, getUserCompany);
user.get("/current-user", userAuth, getCurrentUser);
user.post("/connect-account-stripe-link", userAuth, getCompanyStripeLink);

user.get("/users", getAllUsers);
user.get("/user/:id", getUser);
user.post("/user", createUserValidation, createUser);
user.post("/register-user", createUserValidation, registerUser);
user.patch("/user", updateUser);
user.delete("/user/:id", deleteUser);

module.exports = user;
