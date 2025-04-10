const { QueryTypes } = require("sequelize");

const db = require("../models/");
const sequelize = db.sequelize;
const getRowQuery = (query) => {
  return sequelize.query(query, {
    type: QueryTypes.SELECT,
    raw: false,
  });
};
module.exports = {
  getRowQuery,
};
