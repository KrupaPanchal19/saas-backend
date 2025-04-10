const db = require("../models/");

const findAllCompanies = (data) => {
  return db.company.findAll({
    ...data,
  });
};

const findCompany = (data) => {
  return db.company.findOne({
    ...data,
  });
};

const createCompany = (data, t) => {
  return t
    ? db.company.create(data, { transaction: t })
    : db.company.create(data);
};

const updateCompany = (data, condition) => {
  return db.company.update(data, {
    where: condition,
  });
};

const deleteCompany = (condition) => {
  return db.company.destroy({
    where: condition,
  });
};

module.exports = {
  findAllCompanies,
  findCompany,
  createCompany,
  updateCompany,
  deleteCompany,
};
