const moment = require("moment");
const db = require("../../models/");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

const generalResponse = require("../../helper/general_response.helper");
const {
  addDeliveryHelper,
  editDeliveryHelper,
  deleteDeliveryHelper,
} = require("../../helper/delivery.helper");
const {
  priceUpdateWithId,
  calculateTotalPrice,
} = require("../../helper/price.helper");
const {
  statusAddInHistoryTable,
} = require("../../helper/delivery_history.helper");
const {
  notificationHelper,
} = require("../../helper/notification_status.helper");
const { genRanHex } = require("../../helper/generate-hex-data.helper");
const { DeliveryInfoMail } = require("../../helper/delivery_info_mail.helper");
const sendMailHelper = require("../../helper/sendmail.helper");
const { paymentChargeHelper } = require("../../helper/payment_charge.helper");

const { findAllItems } = require("../../repository/item.repository");
const { findUser } = require("../../repository/user.repository");
const { getRowQuery } = require("../../repository/row_query.repository");
const {
  findDelivery,
  updateDelivery,
} = require("../../repository/delivery.repository");
const {
  addDeliveryDecline,
} = require("../../repository/decline_reason.repository");
const {
  createDeliveryPaymentLogs,
} = require("../../repository/delivery_payment_log.repository");
const {
  findDeliveryCompletedNotes,
  updateDeliveryCompletedNotes,
  createDeliveryCompletedNotes,
} = require("../../repository/delivery_completed_notes.repository");
const {
  createPaymentDeliveryToken,
} = require("../../repository/payment_delivery_token.repository");

const { paymentIntent } = require("../../stripe/paymentIntent");
const { retrievePaymentIntent } = require("../../stripe/retrievePaymentIntent");

const findAllItemByStatus = async (req, res) => {
  try {
    let where = {
      status: "ACTIVE",
      company_id: req.company_id,
    };
    let attributes = ["id", "item_name", "item_image", "status"];
    const data = await findAllItems({ where, attributes });
    if (data && data.length > 0) {
      const itemData = JSON.parse(JSON.stringify(data));
      return generalResponse(res, itemData);
    } else {
      return generalResponse(
        res,
        data,
        "No data found!!",
        "success",
        false,
        200
      );
    }
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
    "user_id",
    "driver_id",
    "pickup_latitude",
    "pickup_longitude",
    "destination_latitude",
    "destination_longitude",
    "store_name",
    "item_heavy",
    "pickup_type",
    "expected_drop_off_delivery_time",
    "status",
    "value_of_item",
    "assembly",
    "payment_type",
    "pickup_contact",
    "dropoff_contact",
    "pickup_contact_phone_number",
    "dropoff_contact_phone_number",
    "discount",
    "discount_type",
  ];
  const invalidOP = update.every((update) => allowUpdate.includes(update));
  if (!invalidOP) {
    return generalResponse(res, [], "invalid operation", "error");
  }
  try {
    const {
      item,
      user_id,
      driver_id,
      pickup_latitude,
      pickup_longitude,
      destination_latitude,
      destination_longitude,
      status,
      ...rest
    } = req.body;
    const itemData = JSON.parse(item);
    const deliveryData = rest;
    deliveryData.createdBy = req.user.id;
    deliveryData.company_id = req.company_id;
    deliveryData.user_id = parseInt(user_id);
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
    if (status === "DRAFT") {
      deliveryData.status = "DRAFT";
      deliveryData.driver_id = driver_id !== "" ? +driver_id : null;
    } else {
      if (driver_id !== "") {
        deliveryData.driver_id = driver_id ? +driver_id : null;
        deliveryData.status = "ASSIGNED";
      } else {
        deliveryData.driver_id = null;
        deliveryData.status = "REQUESTED";
      }
    }
    const functionData = await addDeliveryHelper(
      deliveryData,
      itemData,
      req.files,
      res,
      req
    );
    const userInfo = await findUser({
      where: { id: deliveryData.user_id },
      attributes: ["email", "name"],
    });
    const moment = require("moment");
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
    if (status !== "DRAFT") {
      if (deliveryData.status === "REQUESTED") {
        await sendMailHelper(
          userInfo.name,
          userInfo.email,
          "Delivery Request Submitted",
          extraTextData,
          req.company
        );
      } else {
        const extraText = await DeliveryInfoMail(functionData);
        await sendMailHelper(
          userInfo.name,
          userInfo.email,
          "Your Delivery Date & Driver have been confirmed",
          extraText,
          req.company
        );
      }
    }

    if (functionData > 0) {
      if (rest.payment_type === "manual") {
        const totalInfo = await priceUpdateWithId(functionData, req.company_id);
        if (totalInfo.total === 0) {
          return generalResponse(
            res,
            [],
            "price calculation issue",
            "error",
            true
          );
        }
      }
      return generalResponse(res, [], "Delivery Inserted", "success", true);
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

const getDelivery = async (req, res) => {
  try {
    let filterVar;
    if (req.query.sortData) {
      filterVar = JSON.parse(req.query.sortData);
    }
    let data;
    let IDoffatchData = [];
    let resData = [];
    let queryString = "";
    let statusQuery = "";
    let extraJoinQuery = "";
    let extraSelectData = "";
    let itemData = [];

    let userRoomIds = [];

    let paymentLogId = [];
    let paymentData = [];

    let currentDate = req.headers.currenttime;
    let currentStartDate = moment(currentDate)
      .utc()
      .startOf("day")
      .format("YYYY-MM-DD HH:mm:ss");
    let start = moment(currentStartDate)
      .add(req.headers.timevariationinsecond, "seconds")
      .format("YYYY-MM-DD HH:mm:ss");
    let end = moment(start).add(4, "days").format("YYYY-MM-DD HH:mm:ss");

    if (req.query.deliveryType === "ASSIGNED") {
      statusQuery = `(delivery.status = '${req.query.deliveryType}' OR delivery.status = 'PICKEDUP')`;
      if (filterVar && filterVar.driverId !== "") {
        statusQuery += ` AND (delivery.driver_id = '${filterVar.driverId}')`;
      }
    } else if (req.query.deliveryType === "UPCOMING") {
      statusQuery = `(delivery.status = 'ASSIGNED' OR delivery.status = 'PICKEDUP') AND delivery.expected_delivery_time between '${start}' and '${end}' `;
    } else if (req.query.deliveryType === "COMPLETE") {
      extraSelectData =
        "delivery_histories.createdAt As actual_pickup_time," +
        "(SELECT delivery_reviews.rate FROM delivery_reviews where delivery.id = delivery_reviews.delivery_id) As rat_of_delivery, ";
      extraJoinQuery = `INNER JOIN delivery_histories as delivery_histories on delivery.id = delivery_histories.delivery_id AND delivery_histories.status = "PICKEDUP" `;
      statusQuery = `(delivery.status = 'REVIEWED' OR delivery.status = 'COMPLETED')`;
    } else if (req.query.deliveryType === "DECLINE") {
      statusQuery = `(delivery.status = 'DECLINE')`;
    } else if (req.query.deliveryType === "ALL") {
      if (filterVar && filterVar.jobStatus !== "") {
        statusQuery = `(delivery.status = '${filterVar.jobStatus}')`;
      } else {
        statusQuery = `(delivery.status = 'REQUESTED' OR delivery.status = 'ASSIGNED' OR delivery.status = 'PICKEDUP' OR delivery.status = 'DRAFT')`;
      }
      if (filterVar && filterVar.clientId !== "") {
        statusQuery += ` AND (delivery.user_id = '${filterVar.clientId}')`;
      }
    } else {
      statusQuery = ` delivery.status = '${req.query.deliveryType}'`;
    }

    if (req.query.filterData !== "" && req.query.filterData) {
      queryString =
        `AND (delivery.pickup_location LIKE '%${req.query.filterData}%' ` +
        `OR delivery.destination_location LIKE '%${req.query.filterData}%' ` +
        `OR driver.name LIKE '%${req.query.filterData}%' ` +
        `OR customer.name LIKE '%${req.query.filterData}%' ` +
        `OR delivery.total_price LIKE '%${req.query.filterData}%' ` +
        `OR delivery_payment_logs.payment_status LIKE '%${req.query.filterData}%' ` +
        `OR item.item_name LIKE '%${req.query.filterData}%')`;
    }
    data = await getRowQuery(
      "SELECT " +
        extraSelectData +
        " delivery.id,delivery.pickup_location, delivery.destination_location,delivery.payment_type," +
        "delivery.expected_delivery_time,delivery.room_id,delivery.status,delivery.total_price,driver.name AS driver_name," +
        "customer.name AS customer_name,roles.name AS createdAt_role,delivery_payment_logs.payment_status AS payment_status," +
        "room_users.room_id AS user_room_id,delivery.user_id" +
        " FROM deliveries AS delivery " +
        "LEFT OUTER JOIN users AS customer ON delivery.user_id = customer.id " +
        " LEFT OUTER JOIN users AS driver ON delivery.driver_id = driver.id " +
        " LEFT OUTER JOIN users AS created_by ON delivery.createdBy = created_by.id " +
        "LEFT OUTER JOIN company_users ON company_users.user_id=delivery.createdBy AND company_users.company_id=delivery.company_id LEFT OUTER JOIN roles on roles.id= company_users.role_id " +
        " LEFT OUTER JOIN delivery_payment_logs AS delivery_payment_logs ON delivery.id = delivery_payment_logs.delivery_id " +
        " LEFT JOIN delivery_items AS delivery_item ON delivery.id = delivery_item.delivery_id AND (delivery_item.deletedAt IS NULL)" +
        " LEFT OUTER JOIN items AS item ON delivery_item.item_id = item.id " +
        "LEFT OUTER JOIN room_users AS room_users ON delivery.user_id = room_users.user_id AND delivery.room_id = room_users.room_id  LEFT OUTER JOIN rooms AS rooms ON rooms.id = room_users.room_id AND rooms.delivery_id IS null " +
        extraJoinQuery +
        ` WHERE (delivery.deletedAt IS NULL AND delivery.company_id = ${
          req.company_id
        }  AND (${statusQuery} ${queryString})) GROUP BY delivery.id ORDER BY delivery.updatedAt ${
          filterVar && filterVar.orderBy !== "" ? filterVar.orderBy : "DESC"
        } LIMIT ${(req.query.page - 1) * 10}, 10`
    );
    data.forEach((e) => {
      IDoffatchData.push(e.id);
      paymentLogId.push(e.id);
      e.user_room_id ? userRoomIds.push(e.user_room_id) : null;
    });
    if (IDoffatchData.length > 0) {
      itemData = await getRowQuery(
        "SELECT delivery_items.delivery_id, item.item_name AS item_name FROM delivery_items" +
          " LEFT OUTER JOIN items AS item ON delivery_items.item_id = item.id " +
          ` WHERE (delivery_items.deletedAt IS NULL AND delivery_items.delivery_id IN (${IDoffatchData}) )`
      );
    }

    if (paymentLogId.length > 0) {
      paymentData = await getRowQuery(
        "SELECT delivery_payment_logs.delivery_id,delivery_payment_logs.payment_status, delivery_payment_logs.id, delivery_payment_logs.amount FROM delivery_payment_logs" +
          ` WHERE (delivery_payment_logs.delivery_id IN (${paymentLogId}) ) ORDER BY updatedAt DESC;`
        // GROUP BY delivery_id
      );
    }
    data.forEach((e) => {
      let data = {};
      let itemString;
      data.id = e.id;
      data.pickup = e.pickup_location;
      data.destination = e.destination_location;
      data.total = e.total_price;
      data.payment_type = e.payment_type;
      data.user_room = e.user_room_id;
      data.user_id = e.user_id;
      data.delivery_room = e.room_id;
      if (e.actual_pickup_time) {
        data.actual_pickup_time = e.actual_pickup_time;
      }
      if (e.rat_of_delivery) {
        data.rat_of_delivery = e.rat_of_delivery;
      }
      // data.address = e.pickup_location + " To " + e.destination_location;
      data.expected_delivery_time = e.expected_delivery_time;
      data.status = e.status;
      if (e.customer_name !== null) {
        data.customer = e.customer_name;
      }
      if (e.driver_name !== null) {
        data.driver_name = e.driver_name;
      }
      if (e.createdAt_role !== null) {
        data.created_by = e.createdAt_role;
      }
      if (itemData.length > 0) {
        itemData.filter(function (val, i, arr) {
          val.delivery_id === e.id
            ? itemString === undefined
              ? (itemString = val.item_name)
              : (itemString += "," + val.item_name)
            : "";
        });
      }
      if (paymentData.length > 0) {
        if (e.payment_type === "online") {
          let IdIndexForPayment = paymentData.findIndex(
            (e1) => e.id === e1.delivery_id
          );
          if (IdIndexForPayment > -1) {
            data.payment_status = paymentData[IdIndexForPayment].payment_status;
          }
        } else {
          let deliveryPaymentData = paymentData.filter(
            (e1) => e.id === e1.delivery_id
          );
          if (deliveryPaymentData.length > 0) {
            const total_paid_amount = deliveryPaymentData.reduce(function (
              sum,
              payment_log
            ) {
              return payment_log.amount &&
                payment_log.payment_status === "success"
                ? sum + parseFloat(payment_log.amount)
                : sum;
            },
            0);
            const remaining_amount =
              parseFloat(e.total_price).toFixed(2) -
              parseFloat(total_paid_amount).toFixed(2);
            if (remaining_amount > 0) {
              data.remaining_amount = remaining_amount;
              data.payment_status = "partial payment";
            } else if (remaining_amount === 0) {
              data.remaining_amount = 0;
              data.payment_status = "success";
            }
          } else {
            data.remaining_amount = e.total_price;
            data.payment_status = "pending";
          }
        }
      } else {
        if (e.payment_type === "manual") {
          data.remaining_amount = e.total_price;
          data.payment_status = "pending";
        }
      }

      data.item_name = itemString;
      resData.push(data);
    });
    const pageData = await getRowQuery(
      "SELECT  COUNT(delivery.id) AS count From deliveries AS delivery " +
        "LEFT OUTER JOIN users AS customer ON delivery.user_id = customer.id " +
        " LEFT OUTER JOIN users AS driver ON delivery.driver_id = driver.id " +
        " LEFT OUTER JOIN users AS created_by ON delivery.createdBy = created_by.id " +
        " LEFT OUTER JOIN delivery_payment_logs AS delivery_payment_logs ON delivery.id = delivery_payment_logs.delivery_id " +
        " LEFT JOIN delivery_items AS delivery_item ON delivery.id = delivery_item.delivery_id AND (delivery_item.deletedAt IS NULL)" +
        " LEFT OUTER JOIN items AS item ON delivery_item.item_id = item.id " +
        ` WHERE (delivery.deletedAt IS NULL  AND delivery.company_id = ${req.company_id} AND (${statusQuery} ${queryString})) GROUP BY delivery.id`
    );
    return generalResponse(res, [{ rows: resData, page: pageData.length }], "");
  } catch (e) {
    console.log(e);
    return generalResponse(res, [], e, "error");
  }
};

const getParticularDelivery = async (req, res) => {
  try {
    let where = {
      id: req.params.id,
    };
    const include = [
      {
        model: db.delivery_item,
        as: "delivery_items",
        required: false,
        attributes: ["item_quantity", "image", "item_id", "description"],
      },
      {
        model: db.delivery_payment_log,
        as: "delivery_payment_log",
        where: { payment_status: ["success", "pending"], type: "payment" },
        required: false,
        attributes: ["payment_status"],
      },
    ];
    let attributes = [
      "id",
      "pickup_location",
      "destination_location",
      "pikup_point",
      "destination_point",
      "expected_delivery_time",
      "status",
      "item_description",
      "driver_notes",
      "item_packaged",
      "destination_type",
      "destination_stair_info",
      "destination_elvetor_info",
      "destination_coi_info",
      "store_name",
      "status",
      "driver_id",
      "user_id",
      "item_heavy",
      "pickup_type",
      "expected_drop_off_delivery_time",
      "value_of_item",
      "assembly",
      "payment_type",
      "pickup_contact",
      "dropoff_contact",
      "pickup_contact_phone_number",
      "dropoff_contact_phone_number",
      "discount",
      "discount_type",
    ];

    const data = await findDelivery({
      where,
      include,
      attributes,
    });

    const { pikup_point, destination_point, delivery_items, ...rest } =
      JSON.parse(JSON.stringify(data));
    const resData = rest;
    resData.pickup_point = {
      lat: parseFloat(pikup_point.coordinates[0]),
      lng: parseFloat(pikup_point.coordinates[1]),
    };
    resData.destination_point = {
      lat: parseFloat(destination_point.coordinates[0]),
      lng: parseFloat(destination_point.coordinates[1]),
    };
    const items = [];
    delivery_items.forEach((e) => {
      const { image, item_quantity, description, item_id } = e;
      const imageData = [];
      if (image !== null) {
        let imageJsonData;
        if (process.env.NODE_ENV === "development") {
          imageJsonData = JSON.parse(image.toString());
        } else {
          imageJsonData = image;
        }
        imageJsonData.forEach((element) => {
          imageData.push({
            name: `${process.env.API}${element.image}`,
            preview: `${process.env.API}${element.image}`,
          });
        });
      }
      items.push({
        item_id,
        item_images: imageData,
        item_quantity,
        description,
      });
    });
    resData.items = items;
    return generalResponse(res, resData);
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

const editDelivery = async (req, res) => {
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
    "user_id",
    "driver_id",
    "pickup_latitude",
    "pickup_longitude",
    "destination_latitude",
    "destination_longitude",
    "id",
    "store_name",
    "previous_driver",
    "item_heavy",
    "previous_expected_time",
    "pickup_type",
    "expected_drop_off_delivery_time",
    "status",
    "value_of_item",
    "assembly",
    "payment_type",
    "pickup_contact",
    "dropoff_contact",
    "pickup_contact_phone_number",
    "dropoff_contact_phone_number",
    "discount",
    "discount_type",
  ];
  const invalidOP = update.every((update) => allowUpdate.includes(update));
  if (!invalidOP) {
    return generalResponse(res, [], "invalid operation", "error");
  }
  try {
    const {
      id,
      item,
      user_id,
      driver_id,
      pickup_latitude,
      pickup_longitude,
      destination_latitude,
      destination_longitude,
      previous_driver,
      status,
      ...rest
    } = req.body;
    const itemData = JSON.parse(item);
    const deliveryData = rest;
    deliveryData.user_id = parseInt(user_id);
    if (rest.pickup_location === "undefined") {
      delete rest.pickup_location;
    }
    if (rest.destination_location === "undefined") {
      delete rest.destination_location;
    }
    if (pickup_latitude !== undefined && pickup_longitude !== undefined) {
      var pickup = {
        type: "Point",
        coordinates: [
          parseFloat(pickup_latitude),
          parseFloat(pickup_longitude),
        ],
      };
      deliveryData.pikup_point = pickup;
    }
    if (
      destination_latitude !== undefined &&
      destination_longitude !== undefined
    ) {
      var destination = {
        type: "Point",
        coordinates: [
          parseFloat(destination_latitude),
          parseFloat(destination_longitude),
        ],
      };
      deliveryData.destination_point = destination;
    }
    if (status === "DRAFT") {
      deliveryData.status = "DRAFT";
      deliveryData.driver_id = driver_id !== "" ? +driver_id : null;
    } else {
      if (driver_id !== "") {
        deliveryData.driver_id = driver_id ? +driver_id : null;
        deliveryData.status = "ASSIGNED";
        const userInfo = await findUser({ id: deliveryData.user_id }, [
          "email",
          "name",
        ]);
        const driverInfo = await findUser({ id: driver_id }, ["email", "name"]);
        const extraText = await DeliveryInfoMail(id, driverInfo);
        await sendMailHelper(
          userInfo.name,
          userInfo.email,
          "Your Delivery Date & Driver have been confirmed",
          extraText,
          req.company
        );
      } else {
        deliveryData.driver_id = null;
        deliveryData.status = "REQUESTED";
      }
    }

    const functionData = await editDeliveryHelper(
      id,
      deliveryData,
      itemData,
      req.files,
      req,
      previous_driver ? +previous_driver : null
    );
    if (functionData) {
      if (rest.payment_type === "manual") {
        const totalInfo = await priceUpdateWithId(id, req.company_id);
        if (totalInfo.total === 0) {
          return generalResponse(
            res,
            [],
            "price calculation issue",
            "error",
            true
          );
        }
      }
      return generalResponse(res, [], "Delivery Updated", "success", true);
    } else {
      return generalResponse(
        res,
        [],
        "Delivery not Updated, please try again ......",
        "error",
        true
      );
    }
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

const deleteDelivery = async (req, res) => {
  try {
    let whereCondition = {
      id: req.params.id,
      company_id: req.company_id,
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

const getParticularDeliveryView = async (req, res) => {
  try {
    let where = {
      id: req.params.id,
      company_id: req.company_id,
    };
    const include = [
      {
        model: db.delivery_item,
        as: "delivery_items",
        required: false,
        attributes: ["item_quantity", "image", "item_id", "description"],
        include: [
          {
            model: db.item,
            as: "item",
            required: false,
            paranoid: false,
            attributes: ["item_name"],
          },
        ],
      },
      {
        model: db.user,
        as: "customer",
        required: false,
        paranoid: false,
        attributes: [
          "id",
          "name",
          "email",
          "phone_number",
          "image_path",
          "address",
        ],
      },
      {
        model: db.user,
        as: "driver",
        required: false,
        paranoid: false,
        attributes: ["id", "name", "email", "phone_number", "image_path"],
      },
      {
        model: db.user,
        as: "created_by",
        paranoid: false,
        required: false,
        attributes: ["name"],
      },
      {
        model: db.delivery_history,
        paranoid: false,
        attributes: ["status", "message", "updatedAt"],
        required: false,
      },
      {
        model: db.delivery_review,
        paranoid: false,
        attributes: ["review", "rate"],
        required: false,
      },
      {
        model: db.delivery_completed_notes,
        paranoid: false,
        attributes: ["comment", "images"],
        required: false,
      },
      {
        model: db.delivery_pickup_notes,
        paranoid: false,
        attributes: ["pickup_status", "comment", "images"],
        required: false,
      },
      {
        model: db.delivery_payment_log,
        as: "delivery_payment_log",
        paranoid: false,
        attributes: [
          "payment_type",
          "payment_status",
          "transaction_id",
          "createdAt",
          "type",
          "amount",
        ],
        required: false,
      },
      {
        model: db.decline_reason,
        as: "decline_delivery",
        paranoid: false,
        attributes: ["decline_reason", "createdAt", "show_client"],
        required: false,
      },
      {
        model: db.chat_message,
        as: "messages",
        paranoid: false,
        attributes: ["message", "createdAt"],
        include: [
          {
            model: db.user,
            as: "user_messages_info",
            paranoid: false,
            attributes: ["name", "image_path"],
            include: [
              {
                model: db.company_user,
                // attributes: [],
                where: {
                  company_id: req.company_id,
                  status: "ACTIVE",
                },
                include: [
                  {
                    model: db.role,
                    attributes: ["name"],
                    required: true,
                  },
                ],
              },
            ],
            required: false,
          },
        ],
        required: false,
      },
    ];
    let attributes = [
      "pickup_location",
      "destination_location",
      "expected_delivery_time",
      "status",
      "item_description",
      "driver_notes",
      "item_packaged",
      "destination_type",
      "destination_stair_info",
      "destination_elvetor_info",
      "destination_coi_info",
      "store_name",
      "status",
      "item_heavy",
      "total_price",
      "pickup_type",
      "expected_drop_off_delivery_time",
      "room_id",
      "value_of_item",
      "assembly",
      "payment_type",
      "pickup_contact",
      "dropoff_contact",
      "pickup_contact_phone_number",
      "dropoff_contact_phone_number",
      "discount",
      "discount_type",
    ];
    const data = await findDelivery({
      where,
      include,
      attributes,
      order: [[{ model: db.delivery_history }, "createdAt", "DESC"]],
    });

    const { delivery_items, delivery_histories, ...rest } = JSON.parse(
      JSON.stringify(data)
    );
    const resData = { ...rest };
    const delivery_history = [];
    if (delivery_histories.length > 0) {
      delivery_histories.map((e) => {
        delivery_history.push({ ...e });
      });
    }
    resData.delivery_history = delivery_history;
    const items = [];
    if (delivery_items.length > 0) {
      delivery_items.map((e) => {
        const { image, item, ...restData } = e;
        const imageData = [];
        if (image) {
          let imageJsonData;
          if (process.env.NODE_ENV === "development") {
            imageJsonData = JSON.parse(image.toString());
          } else {
            imageJsonData = image;
          }
          //image ma eror aave to JSON Parse
          imageJsonData.forEach((element) => {
            imageData.push(`${process.env.API}${element.image}`);
          });
        }
        items.push({
          ...restData,
          image: imageData,
          name: item ? item.item_name : "",
        });
      });
    }
    resData.items = items;
    if (
      resData.delivery_completed_note &&
      resData.delivery_completed_note.images
    ) {
      let imageData;
      if (process.env.NODE_ENV === "development") {
        imageData = JSON.parse(resData.delivery_completed_note.images);
      } else {
        imageData = resData.delivery_completed_note.images;
      }
      resData.delivery_completed_note.images = imageData.map((e) => ({
        src: `${process.env.API}${e.image}`,
        altText: "Item Image",
      }));
    }
    if (resData.delivery_note && resData.delivery_note.images) {
      let imageData;
      if (process.env.NODE_ENV === "development") {
        imageData = JSON.parse(resData.delivery_note.images);
      } else {
        imageData = resData.delivery_note.images;
      }
      resData.delivery_note.images = imageData.map((e) => ({
        src: `${process.env.API}${e.image}`,
        altText: "Item Image",
      }));
    }
    return generalResponse(res, resData);
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
  const allowUpdate = ["delivery_id", "show_client", "decline_reason"];
  const invalidOP = update.every((update) => allowUpdate.includes(update));
  if (!invalidOP) {
    return generalResponse(res, [], "invalid operation", "error");
  }
  try {
    const sequelize = db.sequelize;
    t = await sequelize.transaction();
    const { delivery_id, show_client, decline_reason } = req.body;
    const { id } = req.user;

    let where = {
      company_id: req.company_id,
      id: delivery_id,
      status: ["REQUESTED", "ASSIGNED"],
    };
    const include = [
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

    const data = await findDelivery({ where, include, attributes });
    if (data) {
      let deliveryData = {
        status: "DECLINE",
      };

      //payment update
      if (
        data &&
        data.delivery_payment_log &&
        data.delivery_payment_log.length > 0
      ) {
        const resCancel = await cancelPaymentIntent(
          data.delivery_payment_log[0].transaction_id
        );
        if (resCancel.status === "canceled") {
          await editDeliveryPaymentLog(
            { payment_status: "failed", type: "cancel" },
            data.delivery_payment_log[0].transaction_id
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
      await statusAddInHistoryTable(deliveryData.status, delivery_id, id, t);
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
          await notificationHelper(
            delivery_id,
            "DECLINE",
            "the_final_final",
            data.user_id
          );
          await sendMailHelper(
            data.customer.name,
            data.customer.email,
            "Your Delivery Request has been Declined",
            null,
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

const editDriverDelivery = async (req, res) => {
  const update = Object.keys(req.body);
  const allowUpdate = ["driver_id", "id"];
  const invalidOP = update.every((update) => allowUpdate.includes(update));
  if (!invalidOP) {
    return generalResponse(res, [], "invalid operation", "error");
  }
  try {
    const { id, driver_id } = req.body;
    const deliveryData = {};
    deliveryData.driver_id = driver_id ? +driver_id : null;
    deliveryData.status = "ASSIGNED";
    let where = {
      id: id,
    };
    const include = [
      {
        model: db.user,
        as: "customer",
        required: false,
        paranoid: false,
        attributes: [
          "id",
          "name",
          "email",
          "phone_number",
          "image_path",
          "address",
        ],
      },
    ];
    let attributes = ["status", "driver_id", "user_id"];
    const data = await findDelivery({ where, include, attributes });
    const { customer, ...rest } = JSON.parse(JSON.stringify(data));
    const extraText = await DeliveryInfoMail(id);
    await sendMailHelper(
      customer.name,
      customer.email,
      "Your Delivery Date & Driver have been confirmed",
      extraText,
      req.company
    );
    await statusAddInHistoryTable(
      "ASSIGNED",
      id,
      req.user.id,
      null,
      req.user.name,
      driver_id,
      rest.driver_id
    );
    const topic = "the_final_final";
    await notificationHelper(
      id,
      "ASSIGNED",
      topic,
      rest.user_id,
      driver_id,
      rest.driver_id
    );

    const functionData = await updateDelivery(deliveryData, { id });
    if (functionData) {
      return generalResponse(res, [], "Delivery Updated", "success", true);
    } else {
      return generalResponse(
        res,
        [],
        "Delivery not Updated, please try again ......",
        "error",
        true
      );
    }
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

const manualPaymentAddData = async (req, res) => {
  try {
    const {
      delivery_id,
      remaining_amount,
      total_amount,
      current_payment_amount,
      note,
    } = req.body;
    let where = {
      id: delivery_id,
    };

    let attributes = ["total_price", "payment_type"];
    const data = await findDelivery({ where, attributes });
    const jsonData = JSON.parse(JSON.stringify(data));
    if (jsonData.payment_type === "manual") {
      await createDeliveryPaymentLogs({
        payment_type: "manual",
        payment_status: "success",
        delivery_id: delivery_id,
        type: "payment",
        amount: current_payment_amount,
        note: note,
      });
      return generalResponse(
        res,
        [],
        "manual payment is added successfully",
        "success",
        true,
        200
      );
    } else {
      return generalResponse(
        res,
        [],
        "manual payment is not available",
        "error",
        false,
        200
      );
    }
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

const getPoints = async (req, res) => {
  try {
    let where = {
      id: req.params.id,
      status: "PICKEDUP",
      company_id: req.company_id,
    };
    let attributes = [
      "pickup_location",
      "destination_location",
      "pikup_point",
      "destination_point",
      "live_location",
    ];

    const data = await findDelivery({ where, attributes });
    if (data && data !== null) {
      const { pikup_point, destination_point, live_location, ...rest } =
        JSON.parse(JSON.stringify(data));
      const resData = rest;
      resData.pickup_point = {
        lat: parseFloat(pikup_point.coordinates[0]),
        lng: parseFloat(pikup_point.coordinates[1]),
      };
      resData.destination_point = {
        lat: parseFloat(destination_point.coordinates[0]),
        lng: parseFloat(destination_point.coordinates[1]),
      };

      if (live_location !== null) {
        resData.live_point = {
          lat: parseFloat(live_location.coordinates[0]),
          lng: parseFloat(live_location.coordinates[1]),
        };
      } else {
        delete resData["live_location"];
      }
      return generalResponse(res, resData);
    } else {
      return generalResponse(res, [], "Point not found", "success", false, 200);
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

const delivery_completed_notes = async (req, res) => {
  const sequelize = db.sequelize;
  try {
    t = await sequelize.transaction();
    const { delivery_id, comment, status } = req.body;
    let image = [];
    const delivery_status = await findDelivery({
      where: {
        id: delivery_id,
        company_id: req.company_id,
      },
      transaction: t,
    });
    if (delivery_status.status !== "PICKEDUP") {
      throw new Error("you can't completed this delivery");
    }
    image = null;
    const findData = await findDeliveryCompletedNotes({
      where: {
        id: parseInt(delivery_id),
      },
      transaction: t,
    });
    await updateDelivery({ status }, { id: delivery_id }, t);
    await statusAddInHistoryTable(
      status,
      delivery_id,
      req.user.id,
      t,
      req.user.name
    );
    let data = null;
    if (findData) {
      data = await updateDeliveryCompletedNotes(
        {
          delivery_id: parseInt(delivery_id),
          comment: comment ? comment : null,
          images: image,
        },
        { id: parseInt(delivery_id) },
        t
      );
    } else {
      data = await createDeliveryCompletedNotes(
        {
          delivery_id: parseInt(delivery_id),
          comment,
          images: image,
        },
        t
      );
    }
    let msg = "";
    const userInfo = await findUser({
      where: { id: delivery_status.user_id },
      attributes: ["email", "name"],
    });

    //payment
    if (delivery_status.payment_type === "online") {
      const resDataOfPayment = await paymentChargeHelper(
        parseInt(delivery_id),
        req.company.stripe_account_id
      );
      if (resDataOfPayment === true) {
        console.log(resDataOfPayment);
      } else if (resDataOfPayment.mail) {
        if (resDataOfPayment.mail === "success") {
          const extraText = await DeliveryInfoMail(delivery_id);
          await sendMailHelper(
            userInfo.name,
            userInfo.email,
            "Payment Confirmation",
            extraText,
            req.company
          );
          msg = "Delivery payment is successfully completed";
        } else if (resDataOfPayment.mail === "failed") {
          await sendMailHelper(
            userInfo.name,
            userInfo.email,
            "Payment failed",
            null,
            req.company
          );
          msg = "Delivery payment is failed.inform customer";
        }
      }
    }
    await t.commit();
    await notificationHelper(
      delivery_id,
      "COMPLETED",
      "the final final",
      delivery_status.user_id
    );
    const extraText = await DeliveryInfoMail(delivery_id);
    await sendMailHelper(
      userInfo.name,
      userInfo.email,
      "Your Delivery has been Completed!",
      extraText,
      req.company
    );
    if (data) {
      return generalResponse(
        res,
        [],
        "driver completed note added successfully." + msg,
        "success",
        false,
        200
      );
    }
  } catch (e) {
    await t.rollback();
    if (typeof e.message === "string") {
      return generalResponse(res, [], e.message, "error", false, 200);
    } else {
      return generalResponse(
        res,
        [],
        "Something went wrong!!",
        "error",
        false,
        200
      );
    }
  }
};

const generatePaymentLink = async (req, res) => {
  try {
    const id = req.params.id;
    let where = {
      id,
      company_id: req.company_id,
    };
    let attribute = [
      "pikup_point",
      "destination_point",
      "item_heavy",
      "destination_type",
      "destination_stair_info",
      "pickup_location",
      "destination_location",
      "expected_delivery_time",
      "value_of_item",
      "assembly",
      "discount",
      "discount_type",
      "company_id",
    ];
    let relation = [
      {
        model: db.delivery_item,
        as: "delivery_items",
        required: false,
        attributes: ["item_quantity", "description"],
        include: [
          {
            model: db.item,
            as: "item",
            paranoid: false,
            attributes: ["item_name", "flat_rate"],
            required: false,
          },
        ],
      },
      {
        model: db.delivery_payment_log,
        as: "delivery_payment_log",
        required: false,
        attributes: ["payment_status", "transaction_id", "delivery_id", "type"],
        where: {
          payment_type: "online",
          payment_status: { [Op.in]: ["pending", "success"] },
          delivery_id: id,
        },
      },
      {
        model: db.user,
        as: "customer",
        required: true,
        attributes: ["email", "name"],
        include: [
          {
            model: db.company_user,
            attributes: ["payment_customer_id"],
            where: {
              company_id: req.company_id,
            },
            require: true,
            paranoid: false,
          },
        ],
      },
    ];
    const data = await findDelivery({ where, include: relation, attribute });
    if (data) {
      const jsonData = JSON.parse(JSON.stringify(data));
      let pickup_latitude = jsonData.pikup_point.coordinates[0];
      let pickup_longitude = jsonData.pikup_point.coordinates[1];
      let destination_latitude = jsonData.destination_point.coordinates[0];
      let destination_longitude = jsonData.destination_point.coordinates[1];
      let flights_stairs = parseInt(jsonData.destination_stair_info);
      let heavy_item = jsonData.item_heavy;
      let destination_type = jsonData.destination_type;
      let value_of_item = jsonData.value_of_item;
      let assembly = jsonData.assembly;
      let discount = jsonData.discount;
      let discount_type = jsonData.discount_type;
      let delivery_items = [];
      if (jsonData.delivery_items && jsonData.delivery_items.length > 0) {
        delivery_items = jsonData.delivery_items.map((e) => ({
          quantity: e.item_quantity,
          name: e.item.item_name + "(" + e.description + ")",
          flat_rate: e.item.flat_rate,
        }));
      }

      //for calculation of delivery price
      const calculateData = await calculateTotalPrice(req.company_id, {
        flights_stairs,
        pickup_latitude,
        pickup_longitude,
        destination_latitude,
        destination_longitude,
        delivery_id: id,
        heavy_item,
        destination_type,
        delivery_items,
        value_of_item,
        assembly,
        discount,
        discount_type,
      });
      calculateData.totalInCent = Math.round(
        parseFloat(calculateData.after_discount_price) * 100
      );
      //for payment intent create
      if (data.delivery_payment_log.length === 0) {
        const paymentIntentRes = await paymentIntent(
          {
            amount: Math.round(
              parseFloat(calculateData.after_discount_price) * 100
            ),
            currency: "usd",
            payment_method_types: ["card"],
            customer: data.customer.company_users[0].payment_customer_id,
            receipt_email: data.customer.email,
            capture_method: "manual",
            application_fee_amount: 0,
          },
          req.company.stripe_account_id
        );
        if (
          paymentIntentRes &&
          paymentIntentRes.object &&
          paymentIntentRes.id
        ) {
          const paymentData = paymentIntentRes.id;
          const deliveryData = {
            payment_type: "online",
            payment_status: "pending",
            transaction_id: paymentData,
            delivery_id: id,
            type: "payment",
            amount: parseFloat(calculateData.after_discount_price),
          };
          await createDeliveryPaymentLogs(deliveryData);
        } else {
          throw new Error(
            "Something went wrong in create payment intent in stripe"
          );
        }
      }
      if (data.delivery_payment_log.length === 1) {
        const paymentObject = await retrievePaymentIntent(
          data.delivery_payment_log[0].transaction_id,
          req.company.stripe_account_id
        );
        if (paymentObject.status === "requires_capture") {
          return generalResponse(
            res,
            "Customer attached their card successfully",
            "",
            "success",
            true,
            200
          );
        }
      }

      const token = genRanHex();
      let tokenDataForTable = {
        token: token,
        delivery_id: id,
        expire_date: moment(new Date())
          .add(24, "hours")
          .format("YYYY-MM-DD HH:mm:ss"),
      };
      let domainURL = process.env.WEB_URL;
      let extraHtml = `Please use the link below to authorize your payment for your delivery request. Here are the details:
      <div style="width: 100%;float: left;">
      <br/>
      <span><b>Pickup Location</b> : ${data.pickup_location}</span><br/>
      <span><b>Destination Location</b> : ${
        data.destination_location
      }</span><br/>
      <span><b>Requested Pickup Time</b> : ${moment(data.expected_delivery_time)
        .utc()
        .format("MM-DD-YYYY hh:mm A")}</span><br/><br/>
        <span><b>Items</b> : $${delivery_items
          .map((e) => e.name)
          .toString()}</span><br/>  
        <span><b>Total Cost</b> : $${
          calculateData.after_discount_price
        }</span><br/>  
        
      </div>   
     <div style="width:100%;padding:0px;margin:0px;">
        <a href=${domainURL}/payment/${token}>Authorize Payment</a>
        <br/><br/>
        If the above link does not work, please click here:<br/>
        ${domainURL}/payment/${token}
        <br/>
      </div>
      <div style="width:100%;padding:0px;margin:0px;">
        Once payment is authorized we will contact you with your exact delivery date and driver based upon availability. We will do our best to accommodate your request!
      </div>
      `;
      await sendMailHelper(
        data.customer.name,
        data.customer.email,
        "Delivery Request Payment Authorization",
        extraHtml,
        req.company
      );
      await createPaymentDeliveryToken(tokenDataForTable);
      return generalResponse(
        res,
        `${domainURL}/payment/${token}`,
        "Payment link generated successfully",
        "success",
        true,
        200
      );
    } else {
      throw new Error("Something went wrong in your delivery");
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

const calculateDeliveryCharges = async (req, res) => {
  try {
    const { items, item_details, ...rest } = req.body;
    const itemData = await findAllItems({ id: items }, [
      "id",
      "item_name",
      "flat_rate",
    ]);
    if (itemData && itemData.length > 0) {
      const jsonItemData = JSON.parse(JSON.stringify(itemData));
      delivery_items = item_details.map((e) => {
        const itemInfoIndex = jsonItemData.findIndex(
          (e1) => e1.id == e.item_id
        );
        return {
          quantity: e.item_quantity,
          name:
            jsonItemData[itemInfoIndex].item_name +
            (e.description ? "(" + e.description + ")" : ""),
          flat_rate: jsonItemData[itemInfoIndex].flat_rate,
        };
      });
    }
    const data = await calculateTotalPrice(
      req.company_id,
      { ...rest, delivery_items },
      false
    );
    return generalResponse(res, data, "", "success", false);
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

const findDeletedItems = async (req, res) => {
  try {
    const data = await findAllItems({
      where: { id: req.query.id },
      attributes: ["item_name", "item_image", "id", "status"],
      paranoid: false,
    });
    return generalResponse(res, JSON.parse(JSON.stringify(data)));
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

const resendDeliveryInfo = async (req, res) => {
  try {
    if (!req.query?.delivery_id) {
      return generalResponse(res, [], "invalid Data!!", "error", false, 200);
    }

    const include = [
      {
        model: db.user,
        as: "customer",
        required: false,
        paranoid: false,
        attributes: ["name", "email"],
      },
    ];

    let deliveryData = await findDelivery({
      where: { id: req.query.delivery_id },
      attributes: ["id"],
      include,
    });
    deliveryData = JSON.parse(JSON.stringify(deliveryData));

    const extraText = await DeliveryInfoMail(req.query.delivery_id);
    let sentMail = await sendMailHelper(
      deliveryData.customer.name,
      deliveryData.customer.email,
      "Your Delivery update",
      extraText,
      req.company
    );

    return generalResponse(
      res,
      [],
      "Delivery Details sent Successfully",
      "success",
      true
    );
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

module.exports = {
  findAllItemByStatus,
  addDelivery,
  getDelivery,
  getParticularDelivery,
  editDelivery,
  deleteDelivery,
  getParticularDeliveryView,
  declineDelivery,
  editDriverDelivery,
  manualPaymentAddData,
  getPoints,
  delivery_completed_notes,
  generatePaymentLink,
  calculateDeliveryCharges,
  findDeletedItems,
  resendDeliveryInfo,
};
