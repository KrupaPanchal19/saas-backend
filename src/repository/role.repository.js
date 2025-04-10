const db = require("../models/");

const findAllRole = (data) => {
  return db.role.findAll({
    ...data,
  });
};

const findRole = (data) => {
  return db.role.findOne({
    ...data,
  });
};

const createRole = (data) => {
  return db.role.create(data);
};

const bulkCreateRole = (data, t) => {
  return t
    ? db.role.bulkCreate(data, {
        transaction: t,
      })
    : db.role.bulkCreate(data);
};

const deleteRole = (condition) => {
  return db.role.destroy({
    where: condition,
  });
};

module.exports = {
  findAllRole,
  createRole,
  deleteRole,
  bulkCreateRole,
  findRole,
};
