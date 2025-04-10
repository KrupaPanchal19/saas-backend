require("dotenv").config();
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

const db = require("../../models");
const sequelize = db.sequelize;

const generalResponse = require("../../helper/general_response.helper");

const {
  bulkCreatePrice,
  truncatePrice,
  findAllPrice,
} = require("../../repository/price.repository");

const updatePricing = async (req, res) => {
  t = await sequelize.transaction();
  try {
    let createJsonData = [];
    let jsonKey = Object.keys({ ...req.body });
    await jsonKey.forEach((e) => {
      createJsonData.push({
        company_id: req.company_id,
        key: e,
        value: req.body[`${e}`],
      });
    });
    await truncatePrice({
      where: {
        company_id: req.company_id,
        [Op.not]: [{ key: ["publicKey", "privateKey"] }],
      },
      transaction: t,
    });
    await bulkCreatePrice(createJsonData, t);
    await t.commit();
    return generalResponse(res, [], "Pricing updated", "success", true, 200);
  } catch (e) {
    await t.rollback();
    return generalResponse(
      res,
      [],
      "Something went wrong!!",
      "error",
      false,
      200
    );
  }
};

const getPricing = async (req, res) => {
  try {
    const where = {
      company_id: req.company_id,
      [Op.not]: [{ key: ["publicKey", "privateKey"] }],
    };
    const data = await findAllPrice({ where });
    let resData = {};
    const JsonData = JSON.parse(JSON.stringify(data));
    JsonData.forEach((e) => {
      resData[`${e.key}`] = e.value;
    });
    delete resData.publicKey;
    delete resData.privateKey;
    return generalResponse(res, resData);
  } catch (e) {
    return generalResponse(
      res,
      [],
      "Something went wrong!!",
      "error",
      false,
      200
    );
  }
};

module.exports = {
  getPricing,
  updatePricing,
};
