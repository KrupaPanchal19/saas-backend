const db = require("../models/");
const delivery_completed_notes = db.delivery_completed_notes;

const createDeliveryCompletedNotes = (data, t) => {
  return t
    ? delivery_completed_notes.create(data, { transaction: t })
    : delivery_completed_notes.create(data);
};

const findDeliveryCompletedNotes = (data, t) => {
  return delivery_completed_notes.findOne(data);
};

const updateDeliveryCompletedNotes = (data, condition, t) => {
  return t
    ? delivery_completed_notes.update(data, {
        where: condition,
        transaction: t,
      })
    : delivery_completed_notes.update(data, {
        where: condition,
      });
};

module.exports = {
  createDeliveryCompletedNotes,
  findDeliveryCompletedNotes,
  updateDeliveryCompletedNotes,
};
