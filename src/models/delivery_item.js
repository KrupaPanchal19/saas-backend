"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class delivery_item extends Model {
    static associate(models) {
      delivery_item.belongsTo(models.delivery, { foreignKey: "delivery_id" });
      delivery_item.belongsTo(models.item, { foreignKey: "item_id" });
    }
  }
  delivery_item.init(
    {
      item_quantity: DataTypes.INTEGER,
      image: DataTypes.JSON,
      delivery_id: DataTypes.INTEGER,
      item_id: DataTypes.INTEGER,
      description: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "delivery_item",
      paranoid: true,
    }
  );
  return delivery_item;
};
