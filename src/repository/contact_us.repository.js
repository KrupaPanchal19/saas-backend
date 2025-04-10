const db = require("../models/");
const contact_us = db.contact_us;

const findAndCountAllContactUs = (data) => {
  return contact_us.findAndCountAll({
    ...data,
  });
};

const createContactUs = (data, t) => {
  return t
    ? contact_us.create(data, { transaction: t })
    : contact_us.create(data);
};

const deleteContactUs = (condition) => {
  return contact_us.destroy({
    where: condition,
  });
};

module.exports = {
  findAndCountAllContactUs,
  createContactUs,
  deleteContactUs,
};
