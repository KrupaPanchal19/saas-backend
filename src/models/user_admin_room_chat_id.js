"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class user_admin_room_chat_id extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      user_admin_room_chat_id.belongsTo(models.user, {
        targetKey: "id",
        foreignKey: "user_id",
        as: "user_info",
      });
      user_admin_room_chat_id.belongsTo(models.user, {
        targetKey: "id",
        foreignKey: "admin_id",
        as: "admin_info",
      });
      user_admin_room_chat_id.hasMany(models.chat_message, {
        // targetKey: "room_id",
        // otherKey: "room_id",
        sourceKey: "room_id",
        foreignKey: "room",
        as: "chat_messages",
      });
    }
  }
  user_admin_room_chat_id.init(
    {
      company_id: DataTypes.INTEGER,
      user_id: DataTypes.INTEGER,
      admin_id: DataTypes.INTEGER,
      room_id: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "user_admin_room_chat_id",
    }
  );
  return user_admin_room_chat_id;
};
