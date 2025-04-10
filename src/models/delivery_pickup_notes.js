"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class delivery_pickup_notes extends Model {
    static associate(models) {
      delivery_pickup_notes.belongsTo(models.delivery, {
        targetKey: "id",
        foreignKey: "delivery_id",
        as: "delivery",
      });
    }
  }
  delivery_pickup_notes.init(
    {
      delivery_id: DataTypes.INTEGER,
      pickup_status: DataTypes.STRING,
      comment: DataTypes.STRING,
      images: DataTypes.JSON,
    },
    {
      sequelize,
      modelName: "delivery_pickup_notes",
    }
  );
  return delivery_pickup_notes;
};
