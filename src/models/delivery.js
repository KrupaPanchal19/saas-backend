"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class delivery extends Model {
    static associate(models) {
      delivery.belongsTo(models.company, {
        targetKey: "id",
        foreignKey: "company_id",
      });

      delivery.hasMany(models.delivery_item, { foreignKey: "delivery_id" });
      delivery.hasMany(models.delivery_history, { foreignKey: "delivery_id" });

      delivery.hasMany(models.delivery_payment_log, {
        foreignKey: "delivery_id",
        as: "delivery_payment_log",
      });

      delivery.belongsTo(models.user, {
        targetKey: "id",
        foreignKey: "driver_id",
        as: "driver",
      });
      delivery.belongsTo(models.user, {
        foreignKey: "user_id",
        targetKey: "id",
        as: "customer",
      });
      delivery.belongsTo(models.user, {
        targetKey: "id",
        foreignKey: "createdBy",
        as: "created_by",
      });

      delivery.hasOne(models.delivery_pickup_notes, {
        foreignKey: "delivery_id",
      });
      delivery.hasOne(models.delivery_completed_notes, {
        foreignKey: "delivery_id",
      });
      delivery.hasOne(models.delivery_review, {
        foreignKey: "delivery_id",
      });
      delivery.hasOne(models.decline_reason, {
        foreignKey: "delivery_id",
        as: "decline_delivery",
      });

      delivery.hasMany(models.chat_message, {
        sourceKey: "room_id",
        foreignKey: "room_id",
        as: "messages",
      });

      delivery.hasMany(models.payment_delivery_token, {
        sourceKey: "id",
        foreignKey: "delivery_id",
        as: "payment_delivery_token",
      });
    }
  }
  delivery.init(
    {
      company_id: DataTypes.INTEGER,
      pickup_location: DataTypes.STRING,
      destination_location: DataTypes.STRING,
      pikup_point: DataTypes.GEOMETRY("POINT"),
      destination_point: DataTypes.GEOMETRY("POINT"),
      expected_delivery_time: DataTypes.DATE,
      item_description: DataTypes.STRING,
      driver_notes: DataTypes.STRING,
      item_packaged: DataTypes.STRING,
      destination_type: DataTypes.STRING,
      destination_stair_info: DataTypes.STRING,
      destination_elvetor_info: DataTypes.STRING,
      destination_coi_info: DataTypes.STRING,
      status: DataTypes.STRING,
      driver_id: DataTypes.INTEGER,
      createdBy: DataTypes.INTEGER,
      user_id: DataTypes.INTEGER,
      store_name: DataTypes.STRING,
      live_location: DataTypes.GEOMETRY("POINT"),
      room_id: DataTypes.STRING,
      total_price: DataTypes.FLOAT,
      item_heavy: DataTypes.STRING,
      total_info: DataTypes.JSON,
      pickup_type: DataTypes.STRING,
      expected_drop_off_delivery_time: DataTypes.DATE,
      value_of_item: DataTypes.STRING,
      assembly: DataTypes.BOOLEAN,
      payment_type: DataTypes.STRING,
      pickup_contact: DataTypes.STRING,
      dropoff_contact: DataTypes.STRING,
      pickup_contact_phone_number: DataTypes.STRING,
      dropoff_contact_phone_number: DataTypes.STRING,
      discount: DataTypes.FLOAT,
      discount_type: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "delivery",
      paranoid: true,
    }
  );
  return delivery;
};
