"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class delivery_payment_log extends Model {
    static associate(models) {
      delivery_payment_log.belongsTo(models.delivery, { foreignKey: "id" });
    }
  }
  delivery_payment_log.init(
    {
      delivery_id: DataTypes.INTEGER,
      payment_type: DataTypes.STRING,
      payment_status: DataTypes.STRING,
      transaction_id: DataTypes.STRING,
      type: DataTypes.STRING,
      amount: DataTypes.STRING,
      note: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "delivery_payment_log",
    }
  );
  return delivery_payment_log;
};
