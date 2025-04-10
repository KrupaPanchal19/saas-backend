"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class item extends Model {
    static associate(models) {
      item.belongsTo(models.company, {
        targetKey: "id",
        foreignKey: "company_id",
      });

      item.hasMany(models.delivery_item, { foreignKey: "id" });
    }
  }
  item.init(
    {
      item_name: DataTypes.STRING,
      company_id: DataTypes.INTEGER,
      item_image: DataTypes.STRING,
      status: DataTypes.STRING,
      flat_rate: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "item",
      paranoid: true,
    }
  );
  return item;
};
