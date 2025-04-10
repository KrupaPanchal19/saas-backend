"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class service_area_restriction extends Model {
    static associate(models) {
      service_area_restriction.belongsTo(models.company, {
        targetKey: "id",
        foreignKey: "company_id",
      });
    }
  }
  service_area_restriction.init(
    {
      company_id: DataTypes.INTEGER,
      mode: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "service_area_restriction",
      paranoid: false,
      timestamps: false,
    }
  );
  service_area_restriction.removeAttribute("id");
  return service_area_restriction;
};
