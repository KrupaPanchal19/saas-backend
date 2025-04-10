const generalResponse = require("../../helper/general_response.helper");
const { findDelivery } = require("../../repository/delivery.repository");

const getPointOfLiveTracking = async (req, res) => {
  try {
    const id = req.query.id;
    let where;
    if (req.user.role === "driver") {
      where = { id, driver_id: req.user.id };
    } else {
      where = { id, user_id: req.user.id };
    }
    const data = await findDelivery({ where, attributes: ["live_location"] });
    if (data) {
      return generalResponse(
        res,
        data.live_location.coordinates,
        "",
        "success",
        true,
        200
      );
    } else {
      return generalResponse(
        res,
        [],
        "Something went wrong!!",
        "error",
        true,
        200
      );
    }
  } catch (e) {
    console.log(e);
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

module.exports = { getPointOfLiveTracking };
