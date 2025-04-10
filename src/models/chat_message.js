"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class chat_message extends Model {
    static associate(models) {
      chat_message.belongsTo(models.user, {
        targetKey: "id",
        foreignKey: "sender_id",
        as: "user_messages_info",
      });
      chat_message.belongsTo(models.room, {
        targetKey: "id",
        foreignKey: "room_id",
        as: "chat_messages",
      });
      chat_message.belongsTo(models.delivery, {
        sourceKey: "room_id",
        foreignKey: "room_id",
        as: "messages",
      });
    }
  }
  chat_message.init(
    {
      message: DataTypes.STRING,
      sender_id: DataTypes.INTEGER,
      room_id: DataTypes.INTEGER,
      attachment: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "chat_message",
      paranoid: true,
    }
  );
  return chat_message;
};
