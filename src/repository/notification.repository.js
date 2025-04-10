const db = require("../models/");
const Notification = db.notification;

const findAllNotification = (data) => {
  return Notification.findAll({
    ...data,
  });
};

const findAndCountAllNotification = (data) => {
  return Notification.findAndCountAll({
    ...data,
  });
};

const findNotification = (data) => {
  return Notification.findOne({
    ...data,
  });
};

const createNotification = (data, t) => {
  return t
    ? Notification.create(data, { transaction: t })
    : Notification.create(data);
};

const updateNotification = (data, condition) => {
  return Notification.update(data, {
    where: condition,
  });
};

const deleteNotification = (condition) => {
  return Notification.destroy({
    where: condition,
  });
};

module.exports = {
  findAllNotification,
  findAndCountAllNotification,
  findNotification,
  createNotification,
  updateNotification,
  deleteNotification,
};
