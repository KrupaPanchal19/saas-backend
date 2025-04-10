const db = require("../models/");
const ServiceAresRestriction = db.service_area_restriction;

const findServiceAresRestrictionMode = (data) => {
  return ServiceAresRestriction.findOne({ ...data });
};

const updateServiceAresRestrictionMode = (data, condition) => {
  return ServiceAresRestriction.update(data, { where: condition });
};

const createServiceAresRestrictionMode = (data, t) => {
  return t
    ? ServiceAresRestriction.create(data, { transaction: t })
    : ServiceAresRestriction.create(data);
};

module.exports = {
  findServiceAresRestrictionMode,
  updateServiceAresRestrictionMode,
  createServiceAresRestrictionMode,
};
