"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class delivery_history extends Model {
    static associate(models) {
      delivery_history.belongsTo(models.delivery, {
        foreignKey: "id",
      });
      delivery_history.belongsTo(models.user, {
        targetKey: "id",
        foreignKey: "createdBy",
        as: "created_By_history",
      });
    }
  }
  delivery_history.init(
    {
      status: DataTypes.STRING,
      delivery_id: DataTypes.INTEGER,
      message: DataTypes.STRING,
      createdBy: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "delivery_history",
    }
  );
  return delivery_history;
};
