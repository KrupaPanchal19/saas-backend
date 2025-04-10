const db = require("../models/");
const holidays = db.holidays;

const findAllHolidays = (data) => {
  return holidays.findAll({
    ...data,
  });
};

const findHolidays = (data) => {
  return holidays.findOne({
    ...data,
  });
};

const createHolidays = (data, t) => {
  return t ? holidays.create(data, { transaction: t }) : holidays.create(data);
};

const updateHolidays = (data, condition) => {
  return holidays.update(data, {
    where: condition,
  });
};

const deleteHolidays = (condition) => {
  return holidays.destroy({
    where: condition,
  });
};

module.exports = {
  findAllHolidays,
  findHolidays,
  createHolidays,
  updateHolidays,
  deleteHolidays,
};
