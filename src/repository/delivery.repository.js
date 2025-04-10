const db = require("../models/");
const delivery = db.delivery;

const findAllDelivery = (data) => {
  return delivery.findAll({
    ...data,
  });
};

const findDelivery = (data) => {
  return delivery.findOne({...data})
};

const getDeliveryWithRelationWithTransaction = (id, attribute, relation, t) => {
  return delivery.findOne({
    where: { id: id },
    attributes: attribute,
    include: relation,
    transaction: t,
  });
};

const createDelivery = (data, t) => {
  return t ? delivery.create(data, { transaction: t }) : delivery.create(data);
};

const updateDelivery = (data, condition, t) => {
  return t
    ? delivery.update(data, {
        where: condition,
        transaction: t,
      })
    : delivery.update(data, {
        where: condition,
      });
};

const deleteDelivery = (condition, t) => {
  return t
    ? delivery.destroy({
        where: condition,
        transaction: t,
      })
    : delivery.destroy({
        where: condition,
      });
};

const countDelivery = (data) => {
  return delivery.count({
    ...data,
  });
};

module.exports = {
  findAllDelivery,
  findDelivery,
  createDelivery,
  updateDelivery,
  deleteDelivery,
  getDeliveryWithRelationWithTransaction,
  countDelivery,
};
