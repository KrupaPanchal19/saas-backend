const db = require("../models/");
const service_locator = db.service_locator;

const findAllServiceLocator = (data) => {
  return service_locator.findAll({
    ...data,
  });
};

const findAndCountAllServiceLocator = (data) => {
  return service_locator.findAndCountAll({
    ...data,
  });
};

const findServiceLocator = (data) => {
  return service_locator.findOne({
    ...data,
  });
};

const bulkCreateServiceLocator = (data, t) => {
  return t
    ? service_locator.bulkCreate(data, { transaction: t })
    : service_locator.bulkCreate(data);
};

const createServiceLocator = (data, t) => {
  return t
    ? service_locator.create(data, { transaction: t })
    : service_locator.create(data);
};

const updateServiceLocator = (data, condition) => {
  return service_locator.update(data, {
    where: condition,
  });
};

const deleteServiceLocator = (condition) => {
  return service_locator.destroy({
    where: condition,
  });
};

module.exports = {
  findAllServiceLocator,
  findAndCountAllServiceLocator,
  findServiceLocator,
  createServiceLocator,
  bulkCreateServiceLocator,
  updateServiceLocator,
  deleteServiceLocator,
};
