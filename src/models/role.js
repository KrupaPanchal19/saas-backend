"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class role extends Model {
    static associate(models) {
      role.belongsTo(models.company, {
        targetKey: "id",
        foreignKey: "company_id",
      });
      role.hasMany(models.company_user, {
        targetKey: "id",
        foreignKey: "role_id",
      });
    }
  }
  role.init(
    {
      name: DataTypes.STRING,
      company_id: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "role",
      paranoid: true,
    }
  );
  return role;
};
