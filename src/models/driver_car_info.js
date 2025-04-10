"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class driver_car_info extends Model {
    static associate(models) {
      driver_car_info.belongsTo(models.company_user, { foreignKey: "id" });
    }
  }
  driver_car_info.init(
    {
      company_user_id: DataTypes.INTEGER,
      car_model: DataTypes.STRING,
      car_type: DataTypes.STRING,
      car_color: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "driver_car_info",
      paranoid: true,
    }
  );
  return driver_car_info;
};
