const generalResponse = require("../../helper/general_response.helper");
const {
  findDelivery,
  updateDelivery,
} = require("../../repository/delivery.repository");

const add_live_location = async (req, res) => {
  const update = Object.keys(req.body);
  const allowUpdate = ["delivery_id", "latitude", "longitude"];
  const invalidedOP = update.every((update) => allowUpdate.includes(update));
  if (!invalidedOP) {
    return generalResponse(res, [], "invalided operation", "error");
  }
  try {
    const { delivery_id, latitude, longitude } = req.body;
    const data = await findDelivery({
      where: { id: delivery_id, driver_id: req.user.id },
      attributes: ["driver_id"],
    });
    if (data) {
      live_location = {
        type: "Point",
        coordinates: [parseFloat(latitude), parseFloat(longitude)],
      };
      await updateDelivery({ live_location }, delivery_id);
      return generalResponse(
        res,
        [],
        "successfully change",
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

module.exports = { add_live_location };
