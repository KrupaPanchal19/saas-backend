"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class delivery_completed_notes extends Model {
    static associate(models) {
      delivery_completed_notes.belongsTo(models.delivery, {
        targetKey: "id",
        foreignKey: "delivery_id",
        as: "delivery_completed_notes",
      });
    }
  }
  delivery_completed_notes.init(
    {
      delivery_id: DataTypes.INTEGER,
      comment: DataTypes.STRING,
      images: DataTypes.JSON,
    },
    {
      sequelize,
      modelName: "delivery_completed_notes",
    }
  );
  return delivery_completed_notes;
};
