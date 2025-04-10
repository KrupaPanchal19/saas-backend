const db = require("../models/");

const addReview = (data) => {
  const DeliveryReview = db.delivery_review;
  return DeliveryReview.create(data);
};

module.exports = {
  addReview,
};
