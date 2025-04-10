"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class service_locator extends Model {
    static associate(models) {
      service_locator.belongsTo(models.company, {
        targetKey: "id",
        foreignKey: "company_id",
      });
    }
  }
  service_locator.init(
    {
      company_id: DataTypes.INTEGER,
      zipcode: DataTypes.STRING,
      city: DataTypes.STRING,
      state: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "service_locator",
      paranoid: true,
    }
  );
  return service_locator;
};
