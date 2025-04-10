"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class covid_19_cms extends Model {
    static associate(models) {
      covid_19_cms.belongsTo(models.company, {
        targetKey: "id",
        foreignKey: "company_id",
      });
    }
  }
  covid_19_cms.init(
    {
      company_id: DataTypes.INTEGER,
      name: DataTypes.STRING,
      html: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "covid_19_cms",
    }
  );
  return covid_19_cms;
};
