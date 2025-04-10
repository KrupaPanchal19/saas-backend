const db = require("../models/");
const delivery_payment_log = db.delivery_payment_log;

const createDeliveryPaymentLogs = (data, t) => {
  return t
    ? delivery_payment_log.create(data, { transaction: t })
    : delivery_payment_log.create(data);
};
const updateDeliveryPaymentLog = (data, condition) => {
  return delivery_payment_log.update({ ...data }, { where: condition });
};

module.exports = {
  createDeliveryPaymentLogs,
  updateDeliveryPaymentLog,
};
