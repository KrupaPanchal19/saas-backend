const db = require("../models/");
const day_block_time = db.day_block_time;

const findAllDayBlockTime = (data) => {
  return day_block_time.findAll({
    ...data,
  });
};

const findDayBlockTime = (data) => {
  return day_block_time.findOne({
    ...data,
  });
};

const createDayBlockTime = (data, t) => {
  return t
    ? day_block_time.create(data, { transaction: t })
    : day_block_time.create(data);
};

const deleteDayBlockTime = (condition) => {
  return day_block_time.destroy({
    where: condition,
  });
};

module.exports = {
  findAllDayBlockTime,
  findDayBlockTime,
  createDayBlockTime,
  deleteDayBlockTime,
};
