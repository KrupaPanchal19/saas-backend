const generalResponse = require("../../helper/general_response.helper");
// const { addReview } = require("../../repository/delivery_review.repository");
const {
  editDelivery,
  getDeliveryWithTransaction,
  getDeliveryParticularWithRelation,
  editDeliveryWithTransaction,
  findDelivery,
  updateDelivery,
} = require("../../repository/delivery.repository");

const {
  addDeliveryHelper,
  deleteDeliveryHelper,
} = require("../../helper/delivery.helper");

const {
  statusAddInHistoryTable,
} = require("../../helper/delivery_history.helper");
const {
  notificationHelper,
} = require("../../helper/notification_status.helper");
const sendMailHelper = require("../../helper/sendmail.helper");

const { cancelPaymentIntent } = require("../../stripe/cancelPaymentIntent");
const {
  updateDeliveryPaymentLog,
} = require("../../repository/delivery_payment_log.repository");

// const {
//   addDeliveryDecline,
// } = require("../../repository/decline_delivery.repository");

const db = require("../../models/");
const { addReview } = require("../../repository/delivery_review");
const {
  addDeliveryDecline,
} = require("../../repository/decline_reason.repository");

const moment = require("moment");

const addDelivery = async (req, res) => {
  const update = Object.keys(req.body);
  const allowUpdate = [
    "pickup_location",
    "destination_location",
    "destination_type",
    "expected_delivery_time",
    "item_description",
    "driver_notes",
    "item_packaged",
    "destination_stair_info",
    "destination_elvetor_info",
    "destination_coi_info",
    "item",
    "pickup_latitude",
    "pickup_longitude",
    "destination_latitude",
    "destination_longitude",
    "store_name",
    "item_heavy",
    "pickup_type",
    "expected_drop_off_delivery_time",
    "value_of_item",
    "assembly",
    "pickup_contact",
    "dropoff_contact",
    "pickup_contact_phone_number",
    "dropoff_contact_phone_number",
  ];
  const invalidOP = update.every((update) => allowUpdate.includes(update));
  if (!invalidOP) {
    return generalResponse(res, [], "invalid operation", "error");
  }
  try {
    const {
      item,
      pickup_latitude,
      pickup_longitude,
      destination_latitude,
      destination_longitude,
      ...rest
    } = req.body;
    const itemData = JSON.parse(item);
    const deliveryData = rest;
    deliveryData.company_id = req.company_id;
    deliveryData.createdBy = req.user.id;
    deliveryData.user_id = req.user.id;
    var pickup = {
      type: "Point",
      coordinates: [parseFloat(pickup_latitude), parseFloat(pickup_longitude)],
    };
    var destination = {
      type: "Point",
      coordinates: [
        parseFloat(destination_latitude),
        parseFloat(destination_longitude),
      ],
    };
    deliveryData.pikup_point = pickup;
    deliveryData.destination_point = destination;
    deliveryData.status = "REQUESTED";
    deliveryData.payment_type = "online";
    const functionData = await addDeliveryHelper(
      deliveryData,
      itemData,
      req.files,
      res,
      req,
      false
    );
    let extraTextData = `<div>
    <div style="width: 100%;float: left;"> Here are the details of your delivery request: </div>
    <div style="width: 100%;float: left;">
      <span>Pickup Location : ${deliveryData.pickup_location}</span><br/>
      <span>Destination Location : ${
        deliveryData.destination_location
      }</span><br/>
      <span>Requested Delivery Date & Time : ${moment(
        rest.expected_delivery_time
      )
        .utc()
        .format("MM-DD-YYYY hh:mm A")}</span><br/>
    </div>`;
    await sendMailHelper(
      req.user.name,
      req.user.email,
      "Delivery Request Submitted",
      extraTextData,
      req.company
    );
    if (functionData > 0) {
      return generalResponse(
        res,
        {
          delivery_id: functionData,
        },
        "Delivery Inserted",
        "success",
        true
      );
    } else {
      return generalResponse(
        res,
        [],
        "Delivery not Inserted, please try again ......",
        "success",
        true
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

const deleteDelivery = async (req, res) => {
  try {
    let whereCondition = {
      id: req.params.id,
      user_id: req.user.id,
    };
    await deleteDeliveryHelper(req.params.id, whereCondition);
    return generalResponse(res, [], "Delivery deleted", "success", true, 200);
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

const deliveryReview = async (req, res) => {
  try {
    const data = req.body;
    const delivery_status = await findDelivery({
      where: { id: req.body.delivery_id },
      attributes: ["status", "driver_id", "user_id", "payment_type"],
    });
    if (
      delivery_status.status !== "COMPLETED" ||
      delivery_status.user_id !== req.user.id
    ) {
      return generalResponse(
        res,
        [],
        "you can't reviewed this delivery",
        "error",
        true,
        200
      );
    }
    await addReview(data);
    await updateDelivery({ status: "REVIEWED" }, { id: req.body.delivery_id });
    await statusAddInHistoryTable(
      "REVIEWED",
      req.body.delivery_id,
      req.user.id,
      null,
      req.user.name
    );
    await notificationHelper(
      req.body.delivery_id,
      "REVIEWED",
      "the final final",
      delivery_status.user_id,
      delivery_status.driver_id
    );
    return generalResponse(res, [], "Rated successfully", "success", true, 200);
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

const declineDelivery = async (req, res) => {
  const update = Object.keys(req.body);
  const allowUpdate = ["delivery_id", "decline_reason"];
  const invalidOP = update.every((update) => allowUpdate.includes(update));
  if (!invalidOP) {
    return generalResponse(res, [], "invalid operation", "error");
  }
  const sequelize = db.sequelize;
  t = await sequelize.transaction();
  try {
    const { delivery_id, decline_reason } = req.body;
    const show_client = "yes";
    const { id } = req.user;

    let whereCondition = {
      id: delivery_id,
      status: ["REQUESTED", "ASSIGNED"],
    };
    const relation = [
      {
        model: db.delivery_payment_log,
        as: "delivery_payment_log",
        where: {
          payment_status: "pending",
          type: "payment",
        },
        required: false,
        attributes: ["payment_status", "transaction_id"],
      },
      {
        model: db.user,
        as: "customer",
        paranoid: false,
        attributes: ["name", "email"],
        required: false,
      },
    ];
    let attributes = ["user_id", "status"];

    const data = await findDelivery({
      where: whereCondition,
      attributes: attributes,
      include: relation,
    });

    if (data) {
      let deliveryData = {
        status: "DECLINE",
      };

      if (
        data &&
        data.delivery_payment_log &&
        data.delivery_payment_log.length > 0
      ) {
        const resCancel = await cancelPaymentIntent(
          data.delivery_payment_log[0].transaction_id
        );
        if (resCancel.status === "canceled") {
          await updateDeliveryPaymentLog(
            { payment_status: "failed", type: "cancel" },
            { transaction_id: data.delivery_payment_log[0].transaction_id }
          );
        }
      }
      await addDeliveryDecline(
        {
          delivery_id,
          show_client,
          decline_reason,
        },
        t
      );
      await updateDelivery(deliveryData, { id: delivery_id }, t);
      await statusAddInHistoryTable(
        deliveryData.status,
        delivery_id,
        id,
        t,
        req.user.name
      );
      await t.commit();
      if (deliveryData.status === "DECLINE") {
        if (show_client == "yes") {
          await notificationHelper(
            delivery_id,
            "DECLINE",
            "the_final_final",
            data.user_id,
            null,
            null,
            decline_reason
          );
          let extraText = `<div style="width: 100%;float: left;">
          <span>Reason from Admin : ${decline_reason}</span>
        </div>`;
          await sendMailHelper(
            data.customer.name,
            data.customer.email,
            "Your Delivery Request has been Declined",
            extraText,
            req.company
          );
        } else {
          let extraText = `<div>
          <span>Reason from Admin : ${decline_reason}</span>
        </div>`;
          await sendMailHelper(
            data.customer.name,
            data.customer.email,
            "Your Delivery Request has been Declined",
            extraText,
            req.company
          );
        }
      }
      return generalResponse(res, [], "success", "success", false, 200);
    } else {
      return generalResponse(
        res,
        [],
        "you are not allowed to decline this delivery.",
        "error",
        true,
        200
      );
    }
  } catch (e) {
    console.log(e);
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

module.exports = {
  addDelivery,
  deleteDelivery,
  deliveryReview,
  declineDelivery,
};
