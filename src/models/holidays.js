"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class holidays extends Model {
    static associate(models) {
      holidays.belongsTo(models.company, {
        targetKey: "id",
        foreignKey: "company_id",
      });
    }
  }
  holidays.init(
    {
      company_id: DataTypes.INTEGER,
      name: DataTypes.STRING,
      date: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "holidays",
    }
  );
  return holidays;
};
