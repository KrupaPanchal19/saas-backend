const db = require("../models/");
const NotificationToken = db.notification_token;

const createNotificationToken = (data, t) => {
  return t
    ? NotificationToken.create({ ...data }, { transaction: t })
    : NotificationToken.create({ ...data });
};
const findAllNotificationToken = (data) => {
  return NotificationToken.findAll({
    ...data,
  });
};
const findNotificationToken = (data) => {
  return NotificationToken.findOne({
    ...data,
  });
};
const updateNotificationToken = (data, condition) => {
  return NotificationToken.update({ ...data }, { where: condition });
};

const deleteNotificationToken = (where) => {
  return NotificationToken.destroy({ where });
};

module.exports = {
  createNotificationToken,
  findAllNotificationToken,
  findNotificationToken,
  updateNotificationToken,
  deleteNotificationToken,
};
