const db = require("../models/");
const DeliveryHistory = db.delivery_history;

const addDeliveryHistory = (data, t) => {
  return t
    ? DeliveryHistory.create({ ...data }, { transaction: t })
    : DeliveryHistory.create({ ...data });
};

module.exports = {
  addDeliveryHistory,
};
