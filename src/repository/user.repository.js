const db = require("../models/");

const findAllUser = (data) => {
  return db.user.findAll({
    ...data,
  });
};

const findUser = (data) => {
  return db.user.findOne({
    ...data,
  });
};

const createUser = (data, t) => {
  return t ? db.user.create(data, { transaction: t }) : db.user.create(data);
};

const updateUser = (data, condition) => {
  return db.user.update(data, {
    where: condition,
  });
};

const deleteUser = (condition) => {
  return db.user.destroy({
    where: condition,
  });
};

module.exports = { findAllUser, findUser, createUser, updateUser, deleteUser };
