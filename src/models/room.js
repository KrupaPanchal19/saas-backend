"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class room extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      room.belongsTo(models.company, {
        targetKey: "id",
        foreignKey: "company_id",
      });
      room.hasMany(models.room_user, {
        foreignKey: "room_id",
        targetKey: "id",
      });
      room.hasMany(models.chat_message, {
        sourceKey: "id",
        foreignKey: "room_id",
        as: "chat_messages",
      });
      room.belongsTo(models.delivery, {
        as: "room_delivery_chat",
        sourceKey: "id",
        foreignKey: "delivery_id",
      });
    }
  }
  room.init(
    {
      company_id: DataTypes.INTEGER,
      delivery_id: DataTypes.INTEGER,
      created_by: DataTypes.INTEGER,
      read_only: DataTypes.BOOLEAN,
      archive: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "room",
      paranoid: true,
    }
  );
  return room;
};
