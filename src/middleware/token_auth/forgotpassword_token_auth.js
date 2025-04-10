const moment = require("moment");
const db = require("../../models/");

const generalResponse = require("../../helper/general_response.helper");

const {
  getForgetPasswordToken,
} = require("../../repository/forget_password_token.repository.js");

const forgetPasswordTokenAuth = async (req, res, next) => {
  try {
    const token = req.query.token;
    const tokenData = await getForgetPasswordToken(token);
    let currentTime = moment().utc();
    const validTime = moment(tokenData.expire_date).utc();
    if (validTime.isSameOrBefore(currentTime)) {
      return generalResponse(res, [], "Link Expired", "error", true, 200);
    }
    req.tokenInfo = JSON.parse(JSON.stringify(tokenData));
    next();
  } catch (e) {
    return generalResponse(res, [], "something went wrong", "error", true, 200);
  }
};

module.exports = { forgetPasswordTokenAuth };
