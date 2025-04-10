const db = require("../models/");

const insertForgetPasswordToken = (data) => {
  let forget_password_token = db.forget_password_token;
  return forget_password_token.create(data);
};

const getForgetPasswordToken = (data) => {
  let forget_password_token = db.forget_password_token;
  return forget_password_token.findOne({
    where: {
      token: data,
    },
  });
};

const getUserWithRelation = (where, relation, attributes, order) => {
  const user = db.user;
  return user.findOne({
    where,
    attributes,
    include: relation,
    order,
  });
};

module.exports = {
  insertForgetPasswordToken,
  getForgetPasswordToken,
  getUserWithRelation,
};
