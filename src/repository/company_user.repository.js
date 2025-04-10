const db = require("../models/");

const findAllCompanyUser = (data) => {
  return db.company_user.findAll({
    ...data,
  });
};

const findCompanyUser = (data) => {
  return db.company_user.findOne({
    ...data,
  });
};

const createCompanyUser = (data, t) => {
  return t
    ? db.company_user.create(data, { transaction: t })
    : db.company_user.create(data);
};

const updateCompanyUser = (data, condition) => {
  return db.company_user.update(data, {
    where: condition,
  });
};

const deleteCompanyUser = (condition) => {
  return db.company_user.destroy({
    where: condition,
  });
};

module.exports = {
  findAllCompanyUser,
  findCompanyUser,
  createCompanyUser,
  updateCompanyUser,
  deleteCompanyUser,
};
