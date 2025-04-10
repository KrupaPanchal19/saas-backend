const db = require("../models/");
const item = db.item;

const findAllItems = (data) => {
  return item.findAll({
    ...data,
  });
};

const findAndCountAllItems = (data) => {
  return item.findAndCountAll({
    ...data,
  });
};

const findItem = (data) => {
  return item.findOne({
    ...data,
  });
};

const createItem = (data, t) => {
  return t ? item.create(data, { transaction: t }) : item.create(data);
};

const updateItem = (data, condition) => {
  return item.update(data, {
    where: condition,
  });
};

const deleteItem = (condition) => {
  return item.destroy({
    where: condition,
  });
};

module.exports = {
  findAllItems,
  findAndCountAllItems,
  findItem,
  createItem,
  updateItem,
  deleteItem,
};
