const db = require("../models/");
const room = db.room;

const getAllRoom = (data) => {
  return room.findAll({ ...data });
};

const getRoom = (data) => {
  return room.findOne({ ...data });
};

const createRoom = (data, transaction) => {
  return transaction ? room.create(data, { transaction }) : room.create(data);
};

const updateRoom = (data, where) => {
  return room.update(data, { where });
};

module.exports = {
  getAllRoom,
  createRoom,
  getRoom,
  updateRoom,
};
