const generalResponse = require("../../helper/general_response.helper");
const db = require("../../models/");
const moment = require("moment");
const {
  findAllDelivery,
  findDelivery,
} = require("../../repository/delivery.repository");
const { retrievePaymentIntent } = require("../../stripe/retrievePaymentIntent");

const Sequelize = require("sequelize");
const { findCompanyUser } = require("../../repository/company_user.repository");
const Op = Sequelize.Op;

const getDelivery = async (req, res) => {
  try {
    let ts_ms = req.query.current_time * 1000;
    let page = req.query.page;
    let status = req.query.status;
    const currentDate = new Date(ts_ms);
    const currentDateWithoutTime = moment(currentDate)
      .utc()
      .startOf("day")
      .toDate();
    const pageNumber = parseInt(page);
    let limit = 15;
    let offset = (pageNumber - 1) * 15;
    let currentData = [];
    let futureData = [];
    let pastData = [];
    let resData = [];
    let whereCondition;

    let company_user = await findCompanyUser({
      where: { user_id: req.user.id, company_id: req.company_id },
      include: [
        {
          model: db.role,
          as: "role",
          attributes: ["name"],
          paranoid: false,
        },
      ],
    });
    company_user = JSON.parse(JSON.stringify(company_user));

    let role = company_user.role.name;

    if (role === "customer" && status === "upcoming_pickup") {
      whereCondition = {
        company_id: req.company_id,
        user_id: req.user.id,
        [Op.or]: [
          {
            [Op.and]: [
              {
                status: ["REQUESTED", "ASSIGNED"],
                expected_delivery_time: { [Op.gte]: currentDateWithoutTime },
              },
            ],
          },
          {
            status: ["PICKEDUP"],
          },
        ],
      };
    } else if (role === "customer" && status === "account_history") {
      whereCondition = {
        company_id: req.company_id,
        user_id: req.user.id,
        // status: ['COMPLETED', 'REVIEWED', 'DECLINE'],
        [Op.or]: [
          {
            [Op.and]: [
              {
                status: ["REQUESTED", "ASSIGNED"],
                expected_delivery_time: { [Op.lt]: currentDateWithoutTime },
              },
            ],
          },
          {
            status: ["COMPLETED", "REVIEWED", "DECLINE"],
          },
        ],
      };
    } else if (role === "driver" && status === "my_pickup_schedule") {
      whereCondition = {
        company_id: req.company_id,
        driver_id: req.user.id,
        // status: ['ASSIGNED', 'PICKEDUP'],
        [Op.or]: [
          {
            [Op.and]: [
              {
                status: ["ASSIGNED"],
                expected_delivery_time: { [Op.gte]: currentDateWithoutTime },
              },
            ],
          },
          {
            status: ["PICKEDUP"],
          },
        ],
      };
    } else if (role === "driver" && status === "job_history") {
      whereCondition = {
        company_id: req.company_id,
        driver_id: req.user.id,
        // status: ['COMPLETED', 'REVIEWED'],
        [Op.or]: [
          {
            [Op.and]: [
              {
                status: ["ASSIGNED"],
                expected_delivery_time: { [Op.lt]: currentDateWithoutTime },
              },
            ],
          },
          {
            status: ["COMPLETED", "REVIEWED"],
          },
        ],
      };
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
    let attributes = [
      "id",
      "pickup_location",
      "destination_location",
      "expected_delivery_time",
      "status",
      "total_price",
      "expected_drop_off_delivery_time",
      "payment_type",
    ];
    const relation = [
      {
        model: db.delivery_item,
        attributes: ["item_id"],
        as: "delivery_items",
        required: false,
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
        as: "driver",
        paranoid: false,
        attributes: ["name"],
        required: false,
      },
      {
        model: db.user,
        as: "customer",
        paranoid: false,
        attributes: ["name"],
        required: false,
      },
      {
        model: db.delivery_payment_log,
        as: "delivery_payment_log",
        paranoid: false,
        attributes: [
          "payment_status",
          "id",
          "type",
          "transaction_id",
          "amount",
        ],
        required: false,
      },
    ];
    const data = await findAllDelivery({
      where: whereCondition,
      attributes,
      include: relation,
      order: [["expected_delivery_time", "DESC"]],
      limit,
      offset,
    });
    const jsonData = JSON.parse(JSON.stringify(data));
    let startDate = moment(currentDate, "YYYY-MM-DD HH:mm:ss");
    console.log("req.company.stripe_account_id", req.company);
    await Promise.all(
      jsonData.map(async (e) => {
        if (e.delivery_payment_log.length > 0) {
          if (e.payment_type === "online") {
            const successIndex = e.delivery_payment_log.findIndex(
              (e1) =>
                (e1.payment_status === "success" ||
                  e1.payment_status === "pending") &&
                e1.type === "payment"
            );
            if (successIndex > -1) {
              if (
                e.delivery_payment_log[successIndex].payment_status ===
                "pending"
              ) {
                const resPaymentRetrieve = await retrievePaymentIntent(
                  e.delivery_payment_log[successIndex].transaction_id,
                  req.company.stripe_account_id
                );
                if (resPaymentRetrieve.status === "requires_capture") {
                  e.payment_status = "success";
                } else {
                  e.payment_status = "pending";
                }
              } else {
                e.payment_status = "success";
              }
            } else {
              e.payment_status = "pending";
            }
          } else {
            const total_paid_amount = e.delivery_payment_log.reduce(function (
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
              e.remaining_amount = remaining_amount;
              e.payment_status = "partial payment";
            } else if (remaining_amount === 0) {
              e.remaining_amount = 0;
              e.payment_status = "success";
            }
          }
        } else {
          e.payment_status = "pending";
        }

        if (req.user.role === "driver") {
          delete e.total_price;
        }
        let endDate = moment(e.expected_delivery_time, "YYYY-MM-DD HH:mm:ss");
        let diffOfDate = endDate.diff(startDate, "days");

        if (diffOfDate < 0) {
          pastData.push(e);
        } else if (0 === diffOfDate) {
          currentData.push(e);
        } else {
          futureData.push(e);
        }
      })
    );
    // await resData.push(...futureData.reverse());
    futureData = futureData.sort(function (a, b) {
      return (
        moment(a.expected_delivery_time).format("X") -
        moment(b.expected_delivery_time).format("X")
      );
    });
    currentData = currentData.sort(function (a, b) {
      return (
        moment(a.expected_delivery_time).format("X") -
        moment(b.expected_delivery_time).format("X")
      );
    });
    pastData = pastData.sort(function (a, b) {
      return (
        moment(a.expected_delivery_time).format("X") -
        moment(b.expected_delivery_time).format("X")
      );
    });
    await resData.push(...currentData);
    await resData.push(...futureData.reverse());
    // await resData.push(...futureData);
    await resData.push(...pastData.reverse());
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

const getPerticularDelivery = async (req, res) => {
  try {
    let whereCondition = {
      id: parseInt(req.params.id),
    };
    const reletion = [
      {
        model: db.delivery_item,
        as: "delivery_items",
        required: false,
        attributes: ["id", "item_quantity", "image", "description"],
        include: [
          {
            model: db.item,
            as: "item",
            paranoid: false,
            attributes: ["id", "item_name", "item_image"],
            required: false,
          },
        ],
      },
      {
        model: db.user,
        as: "driver",
        required: false,
        paranoid: false,
        attributes: ["name", "phone_number", "email", "image_path"],
        include: [
          {
            model: db.company_user,
            paranoid: false,
            attributes: ["id"],
            where: { company_id: req.company_id },
            required: false,
            include: {
              model: db.driver_car_info,
              paranoid: false,
              attributes: ["car_model", "car_type", "car_color"],
              where: { deletedAt: null },
              required: false,
            },
          },
        ],
      },
      {
        model: db.user,
        as: "customer",
        paranoid: false,
        attributes: ["name", "phone_number", "email", "image_path"],
        required: false,
      },
      {
        model: db.decline_reason,
        as: "decline_delivery",
        paranoid: false,
        attributes: ["decline_reason", "createdAt"],
        where: {
          show_client: "yes",
        },
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
        attributes: ["comment", "images", "createdAt"],
        required: false,
      },
    ];
    let attributes = [
      "id",
      "pickup_location",
      "destination_location",
      ["pikup_point", "pickup_point"],
      "destination_point",
      "expected_delivery_time",
      "item_description",
      "destination_type",
      "driver_notes",
      "status",
      "store_name",
      "room_id",
      "user_id",
      "driver_id",
      "pickup_type",
      "expected_drop_off_delivery_time",
      "pickup_contact",
      "dropoff_contact",
      "pickup_contact_phone_number",
      "dropoff_contact_phone_number",
    ];
    const data = await findDelivery({
      where: whereCondition,
      attributes,
      include: reletion,
    });
    let resData;
    let {
      delivery_items,
      destination_point,
      pickup_point,
      room_id,
      user_id,
      driver_id,
      driver,
      ...rest
    } = data.dataValues;
    resData = rest;

    let driverTemp = JSON.parse(JSON.stringify(driver));
    if (driverTemp) {
      driverTemp.driver_car_infos = driver?.company_users[0]?.driver_car_infos
        ? driver?.company_users[0]?.driver_car_infos
        : null;
      delete driverTemp.company_users;
    }
    resData.driver = driverTemp;
    resData.pickup_point = pickup_point.coordinates;
    resData.destination_point = destination_point.coordinates;
    if (room_id) {
      resData.room_id = room_id;
    }
    let deliveryItemData = [];
    delivery_items.forEach((e) => {
      let element = {};
      element.id = e.id;
      element.item_quantity = e.item_quantity;
      element.item_name = e.item.item_name;
      element.description = e.description;
      let imageList = [];
      if (e.image !== null) {
        let itemImageData;
        if (process.env.NODE_ENV === "development") {
          itemImageData = JSON.parse(e.image);
        } else {
          itemImageData = e.image;
        }
        itemImageData.forEach((e) => {
          imageList.push(e.image);
        });
      }
      element.image = imageList;
      deliveryItemData.push(element);
    });
    resData.delivery_item = deliveryItemData;
    if (user_id === req.user.id || driver_id === req.user.id)
      return generalResponse(res, resData);
    else
      return generalResponse(
        res,
        [],
        "you are not access this delivery",
        "error",
        false,
        200
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
  getDelivery,
  getPerticularDelivery,
};
