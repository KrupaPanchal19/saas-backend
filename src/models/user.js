"use strict";
const { Model } = require("sequelize");
const bcrypt = require("bcrypt");

module.exports = (sequelize, DataTypes) => {
  class user extends Model {
    static associate(models) {
      user.hasMany(models.company_user, {
        foreignKey: "user_id",
      });
      user.hasMany(models.notification_token, { foreignKey: "user_id" });
      user.hasMany(models.room_user, { foreignKey: "user_id" });
      user.hasMany(models.room_user, {
        targetKey: "id",
        foreignKey: "user_id",
        as: "user_info",
      });
      user.hasMany(models.forget_password_token, {
        sourceKey: "id",
        foreignKey: "user_id",
        as: "forget_password_token",
      });
    }
  }
  user.init(
    {
      name: DataTypes.STRING,
      email: DataTypes.STRING,
      password: DataTypes.STRING,
      phone_number: DataTypes.STRING,
      image_path: DataTypes.STRING,
      driver_cdl_license: DataTypes.STRING,
      driver_need_helper: DataTypes.STRING,
      zip_code: DataTypes.STRING,
      address: DataTypes.STRING,
      // payment_customer_id: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "user",
      paranoid: true,
    }
  );
  user.beforeCreate(function (user) {
    if (user.password) {
      user.password = bcrypt.hashSync(
        user.password,
        bcrypt.genSaltSync(10),
        null
      );
    }
    return user;
  });
  user.beforeBulkUpdate(function (user) {
    if (user.attributes.password) {
      user.attributes.password = bcrypt.hashSync(
        user.attributes.password,
        bcrypt.genSaltSync(10),
        null
      );
    }
    return user;
  });
  return user;
};
