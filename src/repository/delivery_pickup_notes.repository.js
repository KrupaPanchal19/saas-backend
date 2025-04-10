const db = require("../models/");
const DeliveryPickupNotes = db.delivery_pickup_notes;

const addDeliveryNotes = (data, t) => {
  return DeliveryPickupNotes.create(data, { transaction: t });
};

const getDeliveryNotes = (id, t) => {
  return DeliveryPickupNotes.findOne({
    where: { delivery_id: id },
    transaction: t,
  });
};

const updateDeliveryNotes = (data, id, t) => {
  return DeliveryPickupNotes.update(data, {
    where: { delivery_id: id },
    transaction: t,
  });
};

module.exports = {
  addDeliveryNotes,
  updateDeliveryNotes,
  getDeliveryNotes,
};
