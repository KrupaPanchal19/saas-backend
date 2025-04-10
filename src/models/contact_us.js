"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class contact_us extends Model {
    static associate(models) {
      contact_us.belongsTo(models.company, {
        targetKey: "id",
        foreignKey: "company_id",
      });
    }
  }
  contact_us.init(
    {
      company_id: DataTypes.INTEGER,
      name: DataTypes.STRING,
      email: DataTypes.STRING,
      phone_number: DataTypes.STRING,
      message: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "contact_us",
      paranoid: true,
    }
  );
  return contact_us;
};
