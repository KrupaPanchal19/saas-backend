const {
  findAllNotificationToken,
} = require("../repository/notification_token.repository");
const { notificationMessage } = require("./notification.helper");

const notificationHelper = async (
  delivery_id,
  status,
  topic,
  user_id,
  driver = null,
  previous_driver = null,
  reason = null
) => {
  let conditionUserId = [];
  let userToken = [];
  let driverToken = [];
  let previousDriverToken = [];

  user_id ? conditionUserId.push(user_id) : null;
  driver ? conditionUserId.push(driver) : null;
  previous_driver ? conditionUserId.push(previous_driver) : null;

  const userTokenData = await findAllNotificationToken({
    where: { user_id: conditionUserId },
    attributes: ["token", "user_id"],
  });

  if (userTokenData) {
    await JSON.parse(JSON.stringify(userTokenData)).forEach((e) => {
      if (parseInt(user_id) === e.user_id) {
        userToken.push(e.token);
      }
      if (parseInt(driver) === e.user_id) {
        driverToken.push(e.token);
      }
      if (parseInt(previous_driver) === e.user_id) {
        previousDriverToken.push(e.token);
      }
    });
  }
  if (userToken.length > 0) {
    switch (status) {
      case "REQUESTED":
        if (driver === null && previous_driver === null) {
          await notificationMessage(
            userToken,
            `Your delivery request has been created successfully.`,
            "Delivery Request Submitted",
            topic
          );
        } else if (driver === null && previous_driver !== null) {
          await notificationMessage(
            userToken,
            `Driver remove in delivery.`,
            "Delivery Status",
            topic
          );
          if (driverToken.length > 0) {
            await notificationMessage(
              driverToken,
              "Driver remove to delivery.",
              "Delivery Status",
              topic
            );
          }
        }
        break;
      case "ASSIGNED":
        if (driver !== null && previous_driver === null) {
          await notificationMessage(
            userToken,
            `Driver has been assigned to your delivery`,
            "Delivery Status",
            topic
          );
          if (driverToken.length > 0) {
            await notificationMessage(
              driverToken,
              "You are assigned to delivery.",
              "Delivery Status",
              topic
            );
          }
        } else if (
          driver !== null &&
          previous_driver !== null &&
          driver !== previous_driver
        ) {
          if (driverToken.length > 0) {
            await notificationMessage(
              driverToken,
              "You are assigned to delivery.",
              "Delivery Status",
              topic
            );
          }
          if (previousDriverToken.length > 0) {
            await notificationMessage(
              previousDriverToken,
              "You are remove to delivery.",
              "Delivery Status",
              topic
            );
          }
        }
        break;
      case "PICKEDUP":
        await notificationMessage(
          userToken,
          `A driver has pick-up your items.`,
          "Delivery Status",
          topic
        );
        break;
      case "COMPLETED":
        const extraData = { delivery_id, type: "complete_delivery" };
        await notificationMessage(
          userToken,
          `Your delivery has been completed. Click here to rate your driver`,
          "Complete Delivery",
          topic,
          extraData
        );
        break;
      case "REVIEWED":
        await notificationMessage(
          userToken,
          `Thank you for taking the time to submit your rating & review`,
          "Your rating as been accepted!",
          topic
        );
        if (driverToken > 0) {
          await notificationMessage(
            driverToken,
            "Customer is review the delivery.",
            "Delivery Review",
            topic
          );
        }
        break;
      case "DELETED":
        await notificationMessage(
          userToken,
          `Your delivery has deleted by admin.`,
          "delivery deleted",
          topic
        );
        break;
      case "PICKUPTIMECHANGE":
        await notificationMessage(
          userToken,
          `Your delivery's pick-up time change by admin.`,
          "Pickup Time Change",
          topic
        );
        break;
      case "DECLINE":
        await notificationMessage(
          userToken,
          `Your delivery is declined.`,
          "Delivery Decline",
          topic
        );
        break;
      default:
        break;
    }
  }
};
module.exports = { notificationHelper };
