const {
  addDeliveryHistory,
} = require("../repository/delivery_history.repository");

const statusAddInHistoryTable = async (
  status,
  delivery_id,
  createdBy,
  t,
  name = "",
  driver = null,
  previous_driver = null
) => {
  try {
    let message = "";
    switch (status) {
      case "REQUESTED":
        if (driver === null && previous_driver === null)
          message = `Delivery request successfully created`;
        else if (driver === null && previous_driver !== null)
          message = `Driver remove in delivery`;
        break;
      case "ASSIGNED":
        if (driver !== null && previous_driver === null)
          message = `Driver has been assigned to your delivery`;
        else if (
          driver !== null &&
          previous_driver !== null &&
          driver !== previous_driver
        )
          message = `Driver has been change in delivery`;
        break;
      case "PICKEDUP":
        message = `${name} has picked up your items`;
        break;
      case "COMPLETED":
        message = `Your item was successfully delivered by ${name}`;
        break;
      case "REVIEWED":
        message = `Delivery reviewed by ${name}`;
        break;
      case "DECLINE":
        message = `Your delivery is declined by ${
          name !== "" ? name : "Admin"
        }`;
        break;
      case "DRAFT":
        message = `Your delivery is added with Draft`;
        break;
      default:
        break;
    }
    const historyData = {
      status,
      delivery_id,
      message,
      createdBy,
    };
    if (t === null) {
      await addDeliveryHistory(historyData);
    } else {
      await addDeliveryHistory(historyData, t);
    }
    return message;
  } catch (e) {
    return false;
  }
};
module.exports = {
  statusAddInHistoryTable,
};
