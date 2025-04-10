"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class company extends Model {
    static associate(models) {
      company.hasMany(models.role, { foreignKey: "company_id" });
      company.hasMany(models.item, { foreignKey: "company_id" });
      company.hasMany(models.holidays, { foreignKey: "company_id" });
      company.hasMany(models.day_block_time, { foreignKey: "company_id" });
      company.hasOne(models.service_area_restriction, {
        foreignKey: "company_id",
      });
      company.hasMany(models.service_locator, { foreignKey: "company_id" });
      company.hasMany(models.price, { foreignKey: "company_id" });
      company.hasMany(models.notification, { foreignKey: "company_id" });
      company.hasMany(models.contact_us, { foreignKey: "company_id" });
      company.hasMany(models.covid_19_cms, { foreignKey: "company_id" });
      company.hasMany(models.delivery, { foreignKey: "company_id" });
      company.hasMany(models.room, { foreignKey: "company_id" });
      company.hasMany(models.room_user, { foreignKey: "company_id" });

      // company.belongsTo(models.company_user, {
      //   foreignKey: "id",
      // });
    }
  }
  company.init(
    {
      name: DataTypes.STRING,
      logo: DataTypes.STRING,
      short_name: DataTypes.STRING,
      stripe_account_id: DataTypes.STRING,
      stripe_account_status: {
        type: DataTypes.STRING,
        defaultValue: "Restricted",
      },
    },
    {
      sequelize,
      modelName: "company",
      paranoid: true,
    }
  );
  return company;
};
