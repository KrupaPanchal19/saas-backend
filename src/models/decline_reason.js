"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class decline_reason extends Model {
    static associate(models) {
      decline_reason.belongsTo(models.delivery, {
        targetKey: "id",
        foreignKey: "delivery_id",
        as: "delivery",
      });
    }
  }
  decline_reason.init(
    {
      delivery_id: DataTypes.INTEGER,
      decline_reason: DataTypes.STRING,
      show_client: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "decline_reason",
    }
  );
  return decline_reason;
};
