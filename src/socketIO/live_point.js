const { findDelivery, updateDelivery } = require("../repository/delivery.repository");

const setLivePoint = async (data) => {
  const update = Object.keys(data);
  const allowUpdate = ["id", "delivery_id", "latitude", "longitude"];
  const invalidedOP = update.every((update) => allowUpdate.includes(update));
  if (!invalidedOP) {
    return false;
  }
  try {
    const { id, delivery_id, latitude, longitude } = data;
    const getResData = await findDelivery({
      where: { id: delivery_id, driver_id: id },
      attributes: ["driver_id", "user_id"],
    });
    if (getResData) {
      live_location = {
        type: "Point",
        coordinates: [parseFloat(latitude), parseFloat(longitude)],
      };
      await updateDelivery({ live_location }, { id: delivery_id });
      return getResData.user_id;
    } else {
      return false;
    }
  } catch (e) {
    console.log(e);
    return false;
  }
};

module.exports = { setLivePoint };
