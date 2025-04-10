const express = require("express");
const {
  forgetPasswordTokenAuth,
} = require("../../middleware/token_auth/forgotpassword_token_auth");
const forget_password = express.Router();
const {
  forgetPasswordController,
  getForgetPasswordInfo,
  updatePassword,
} = require("../../controller/forgot_password/forgot_password.controller");

forget_password.post("/forget_password", forgetPasswordController);

forget_password.get(
  "/forget-password-data",
  forgetPasswordTokenAuth,
  getForgetPasswordInfo
);

forget_password.post("/update_password", updatePassword);

module.exports = forget_password;
