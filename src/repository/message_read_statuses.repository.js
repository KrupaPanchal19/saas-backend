const db = require("../models/");
const message_read_status = db.message_read_status;

const createMessageReadStatus = (data) => {
  return message_read_status.bulkCreate(data);
};

const countUnreadMessageReadStatus = (id) => {
  return message_read_status.count({
    where: { receiver_id: id },
    attributes: ["room_id"],
    group: ["room_id"],
  });
};

const countUnreadMessageReadStatusForApp = (where) => {
  return message_read_status.count({
    where,
  });
};

const deleteUserUnreadMessageReadForUser = (id, room_id) => {
  return message_read_status.destroy({
    where: {
      room_id,
      receiver_id: id,
    },
  });
};

module.exports = {
  createMessageReadStatus,
  countUnreadMessageReadStatus,
  countUnreadMessageReadStatusForApp,
  deleteUserUnreadMessageReadForUser,
};
