"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class price extends Model {
    static associate(models) {
      price.belongsTo(models.company, {
        targetKey: "id",
        foreignKey: "company_id",
      });
    }
  }
  price.init(
    {
      company_id: DataTypes.INTEGER,
      key: DataTypes.STRING,
      value: DataTypes.STRING,
    },
    {
      sequelize,
      timestamps: false,
      modelName: "price",
    }
  );
  return price;
};
