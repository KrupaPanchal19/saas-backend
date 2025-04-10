const moment = require("moment");
const db = require("../../models/");

const generalResponse = require("../../helper/general_response.helper");

const {
  findPaymentDeliveryToken,
} = require("../../repository/payment_delivery_token.repository");

const paymentTokenAuth = async (req, res, next) => {
  try {
    const token = req.query.token;
    const tokenData = await findPaymentDeliveryToken({
      where: { token },
      include: [
        {
          model: db.delivery,
          attributes: ["company_id"],
          require: true,
        },
      ],
    });
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

module.exports = paymentTokenAuth;
