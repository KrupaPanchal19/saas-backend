const db = require("../models/");
const DriverCarInfo = db.driver_car_info;

const createDriverCarInfo = (data, t) => {
  return t
    ? DriverCarInfo.bulkCreate(data, { transaction: t })
    : DriverCarInfo.bulkCreate(data);
};

const findDriverCarInfo = (data) => {
  return DriverCarInfo.findAll({
    ...data,
  });
};

const deleteDriverCarInfo = (data) => {
  return DriverCarInfo.destroy({ ...data });
};

module.exports = {
  createDriverCarInfo,
  deleteDriverCarInfo,
  findDriverCarInfo,
};
