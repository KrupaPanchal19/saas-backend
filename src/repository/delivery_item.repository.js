const db = require("../models/");
const DeliveryItem = db.delivery_item;

const bulkCreateDeliveryItem = (data, t) => {
  return t
    ? DeliveryItem.bulkCreate(data, { transaction: t })
    : DeliveryItem.bulkCreate(data);
};

const deleteDeliveryItem = (data) => {
  return DeliveryItem.destroy({ ...data });
};

module.exports = { bulkCreateDeliveryItem, deleteDeliveryItem };
