"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class payment_delivery_token extends Model {
    static associate(models) {
      payment_delivery_token.belongsTo(models.delivery, {
        sourceKey: "id",
        foreignKey: "delivery_id",
      });
    }
  }
  payment_delivery_token.init(
    {
      delivery_id: DataTypes.INTEGER,
      token: DataTypes.STRING,
      expire_date: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "payment_delivery_token",
    }
  );
  return payment_delivery_token;
};
