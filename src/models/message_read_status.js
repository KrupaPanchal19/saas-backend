"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class message_read_status extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      message_read_status.belongsTo(models.room, {
        foreignKey: "room_id",
        targetKey: "id",
      });
      message_read_status.belongsTo(models.user, {
        targetKey: "id",
        foreignKey: "receiver_id",
      });
      message_read_status.belongsTo(models.chat_message, {
        targetKey: "id",
        foreignKey: "message_id",
      });
    }
  }
  message_read_status.init(
    {
      receiver_id: DataTypes.INTEGER,
      message_id: DataTypes.INTEGER,
      room_id: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "message_read_status",
    }
  );
  return message_read_status;
};
