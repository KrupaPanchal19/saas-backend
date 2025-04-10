"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class forget_password_token extends Model {
    static associate(models) {
      forget_password_token.belongsTo(models.user, {
        as: "forget_password_token",
        sourceKey: "id",
        foreignKey: "user_id",
      });
    }
  }
  forget_password_token.init(
    {
      token: DataTypes.STRING,
      user_id: DataTypes.INTEGER,
      expire_date: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "forget_password_token",
    }
  );
  return forget_password_token;
};
