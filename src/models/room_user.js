"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class room_user extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      room_user.belongsTo(models.company, {
        targetKey: "id",
        foreignKey: "company_id",
      });
      room_user.belongsTo(models.room, {
        foreignKey: "room_id",
        targetKey: "id",
      });
      room_user.belongsTo(models.user, {
        targetKey: "id",
        foreignKey: "user_id",
        as: "user_info",
      });
    }
  }
  room_user.init(
    {
      company_id: DataTypes.INTEGER,
      room_id: DataTypes.INTEGER,
      user_id: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "room_user",
    }
  );
  // room_user.removeAttribute("id");
  return room_user;
};
