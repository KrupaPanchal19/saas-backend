const express = require("express");
const company = express.Router();

//middleware
const {
  createCompanyValidation,
  updateCompanyValidation,
  registerCompanyValidation,
} = require("../../middleware/validator/company.validator");

//controller
const {
  getAllCompanies,
  getCompany,
  createCompany,
  updateCompany,
  deleteCompany,
  registerCompany,
} = require("../../controller/company/company.controller");

company.get("/companies", getAllCompanies);
company.get("/company/:id", getCompany);
company.post("/company", createCompanyValidation, createCompany);
company.patch("/company", updateCompanyValidation, updateCompany);
company.delete("/company/:id", deleteCompany);
company.post("/register-company", registerCompanyValidation, registerCompany);

module.exports = company;
