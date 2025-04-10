const db = require("../models/");
let payment_delivery_token = db.payment_delivery_token;

const createPaymentDeliveryToken = (data) => {
  return payment_delivery_token.create(data);
};

const findPaymentDeliveryToken = (data) => {
  return payment_delivery_token.findOne({
    ...data,
  });
};

module.exports = { createPaymentDeliveryToken, findPaymentDeliveryToken };
