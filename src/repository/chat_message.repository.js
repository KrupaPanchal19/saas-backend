const db = require("../models/");
const ChatMessage = db.chat_message;
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

const getMessageRoomForChat = (data, company_id) => {
  return ChatMessage.findAll({
    where: { room_id: data.room_id },
    order: [["createdAt", "ASC"]],
    attributes: [
      "sender_id",
      "message",
      "createdAt",
      "room_id",
      "attachment",
      "id",
    ],
    include: [
      {
        model: db.room,
        as: "chat_messages",
        where: { company_id: data.company_id },
      },
      {
        model: db.user,
        as: "user_messages_info",
        paranoid: false,
        attributes: ["name", "image_path"],
        required: false,
        include: [
          {
            model: db.company_user,
            paranoid: false,
            attributes: ["id"],
            include: [
              {
                model: db.role,
                paranoid: false,
                attributes: ["name"],
              },
            ],
          },
        ],
      },
    ],
  });
};

const saveMessageForChat = (data) => {
  return ChatMessage.create(data);
};

const getMessagesChatForAdmin = (where, order, attributes, relation, group) => {
  return ChatMessage.findAll({
    where,
    order,
    attributes,
    include: relation,
    group,
  });
};

const updateChatMessageReadStatus = (data, where) => {
  return ChatMessage.update(data, { where });
};

module.exports = {
  getMessageRoomForChat,
  saveMessageForChat,
  getMessagesChatForAdmin,
  updateChatMessageReadStatus,
};
