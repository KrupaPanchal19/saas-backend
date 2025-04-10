const db = require("../models/");
const Price = db.price;

const bulkCreatePrice = (data, t) => {
  return t
    ? Price.bulkCreate(data, {
        transaction: t,
      })
    : Price.bulkCreate(data);
};

const truncatePrice = (data) => {
  return Price.destroy({
    ...data,
  });
};

const findAllPrice = (data) => {
  return Price.findAll({ ...data });
};

module.exports = { bulkCreatePrice, truncatePrice, findAllPrice };
