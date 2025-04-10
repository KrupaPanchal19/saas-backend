const db = require("../models/");
const DeliveryDecline = db.decline_reason;

const addDeliveryDecline = (data, t) => {
  return DeliveryDecline.create(data, { transaction: t });
};

module.exports = {
  addDeliveryDecline,
};
