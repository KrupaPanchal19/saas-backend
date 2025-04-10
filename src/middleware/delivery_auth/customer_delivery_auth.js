const generalResponse = require("../../helper/general_response.helper");
const { findDelivery } = require("../../repository/delivery.repository");

const customerDeliveryAuth = async (req, res, next) => {
  try {
    const resData = await findDelivery({
      where: { id: req.body.delivery_id, company_id: req.company_id },
      attributes: ["user_id"],
    });
    if (resData.user_id === req.user.id) {
      return next();
    } else {
      throw new Error("you are not access this delivery");
    }
  } catch (e) {
    return generalResponse(res, [], e.message, "error", true, 200);
  }
};

module.exports = customerDeliveryAuth;
