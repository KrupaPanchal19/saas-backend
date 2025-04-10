"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class notification_token extends Model {
    static associate(models) {
      notification_token.belongsTo(models.user, {
        targetKey: "id",
        foreignKey: "user_id",
        as: "notification_token",
      });
    }
  }
  notification_token.init(
    {
      user_id: DataTypes.INTEGER,
      uuid: DataTypes.STRING,
      token: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "notification_token",
      paranoid: true,
    }
  );
  return notification_token;
};
