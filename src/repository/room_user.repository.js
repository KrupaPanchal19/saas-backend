const db = require("../models/");
const room_user = db.room_user;

const createRoomUser = (data, transaction) => {
  return transaction
    ? room_user.bulkCreate(data, { transaction })
    : room_user.bulkCreate(data);
};

const findRoomUser = (data, transaction) => {
  return transaction
    ? room_user.findOne({ ...data, transaction })
    : room_user.findOne({ ...data });
};

const findAllRoomUser = (data) => {
  return room_user.findAll({ ...data });
};

module.exports = {
  createRoomUser,
  findRoomUser,
  findAllRoomUser,
};
