"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class notification extends Model {
    static associate(models) {
      notification.belongsTo(models.company, {
        targetKey: "id",
        foreignKey: "company_id",
      });
    }
  }
  notification.init(
    {
      company_id: DataTypes.INTEGER,
      title: DataTypes.STRING,
      message: DataTypes.STRING,
      customer: {
        type: DataTypes.STRING,
        allowNull: true,
        get() {
          if (this.getDataValue("customer"))
            return this.getDataValue("customer").split(";");
        },
        set(val) {
          this.setDataValue("customer", val.join(";"));
        },
      },
      driver: {
        type: DataTypes.STRING,
        allowNull: true,
        get() {
          if (this.getDataValue("driver"))
            return this.getDataValue("driver").split(";");
        },
        set(val) {
          this.setDataValue("driver", val.join(";"));
        },
      },
    },
    {
      sequelize,
      modelName: "notification",
      paranoid: true,
    }
  );
  return notification;
};
