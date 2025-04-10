"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class company_user extends Model {
    static associate(models) {
      company_user.belongsTo(models.company, {
        targetKey: "id",
        foreignKey: "company_id",
      });
      company_user.belongsTo(models.role, {
        targetKey: "id",
        foreignKey: "role_id",
      });
      company_user.belongsTo(models.user, {
        targetKey: "id",
        foreignKey: "user_id",
      });
      company_user.hasMany(models.driver_car_info, {
        foreignKey: "company_user_id",
      });
    }
  }
  company_user.init(
    {
      user_id: DataTypes.INTEGER,
      company_id: DataTypes.INTEGER,
      role_id: DataTypes.INTEGER,
      status: DataTypes.STRING,
      id_number: DataTypes.STRING,
      payment_customer_id: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "company_user",
      paranoid: true,
    }
  );
  return company_user;
};
