const db = require("../models/");
const covid_19_cms = db.covid_19_cms;

const createCovid19CMS = (data, t) => {
  return t
    ? covid_19_cms.create(data, { transaction: t })
    : covid_19_cms.create(data);
};
const findCovid19CMS = (data) => {
  return covid_19_cms.findOne({
    ...data,
  });
};

const updateCovid19CMS = (data, condition) => {
  return covid_19_cms.update(data, {
    where: condition,
  });
};

module.exports = {
  createCovid19CMS,
  findCovid19CMS,
  updateCovid19CMS,
};
