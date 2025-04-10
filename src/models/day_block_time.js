"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class day_block_time extends Model {
    static associate(models) {
      day_block_time.belongsTo(models.company, {
        targetKey: "id",
        foreignKey: "company_id",
      });
    }
  }
  day_block_time.init(
    {
      company_id: DataTypes.INTEGER,
      day: DataTypes.STRING,
      from_time: DataTypes.STRING,
      to_time: DataTypes.STRING,
    },
    {
      sequelize,
      timestamps: false,
      modelName: "day_block_time",
    }
  );
  return day_block_time;
};
