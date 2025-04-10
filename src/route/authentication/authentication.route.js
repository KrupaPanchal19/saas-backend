const express = require("express");
const authentication = express.Router();

const {
  login,
  emailCheck,
} = require("../../controller/authentication/authentication.controller");

authentication.post("/login", login);

authentication.post("/email-check", emailCheck);

module.exports = authentication;
