"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class delivery_review extends Model {
    static associate(models) {
      delivery_review.belongsTo(models.delivery, {
        targetKey: "id",
        foreignKey: "delivery_id",
        as: "delivery_review",
      });
    }
  }
  delivery_review.init(
    {
      delivery_id: DataTypes.INTEGER,
      review: DataTypes.STRING,
      rate: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "delivery_review",
    }
  );
  return delivery_review;
};
