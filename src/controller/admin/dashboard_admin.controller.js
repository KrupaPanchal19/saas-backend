const db = require("../../models/");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const moment = require("moment");

const generalResponse = require("../../helper/general_response.helper");

const {
  findAllDelivery,
  countDelivery,
} = require("../../repository/delivery.repository");
const { getRowQuery } = require("../../repository/row_query.repository");
const {
  findAllCompanyUser,
} = require("../../repository/company_user.repository");

const deliveryCountDashboard = async (req, res) => {
  try {
    let resData = {};
    let currentDate = req.headers.currenttime;
    let currentStartDate = moment(currentDate).utc().startOf("day").toDate();
    let endDate = moment(currentDate).utc().endOf("day").toDate();
    let start = moment(currentStartDate)
      .add(req.headers.timevariationinsecond, "seconds")
      .toDate();
    let end = moment(endDate)
      .add(req.headers.timevariationinsecond, "seconds")
      .toDate();
    const attributes = [
      "status",
      [db.sequelize.fn("COUNT", db.sequelize.col("status")), "count"],
    ];
    const where = {
      expected_delivery_time: {
        [Op.between]: [start, end],
      },
      status: { [Op.in]: ["ASSIGNED", "PICKEDUP"] },
      company_id: req.company_id,
    };

    const data = await findAllDelivery({
      attributes,
      group: "status",
      raw: true,
      where: {
        company_id: req.company_id,
        status: { [Op.in]: ["REQUESTED", "ASSIGNED", "COMPLETED", "REVIEWED"] },
      },
    });
    const upcomingData = await countDelivery({ where });
    if (data !== [] && data.length > 0) {
      data.push({ status: "UPCOMING", count: upcomingData });
      let countCompelete = 0;
      data.map((e) => {
        e.status !== "COMPLETED" && e.status !== "REVIEWED"
          ? (resData[e.status] = e.count)
          : (countCompelete = countCompelete + e.count);
      });
      resData["COMPLETED"] = countCompelete;
      return generalResponse(res, resData, "", "success", false, 200);
    } else {
      return generalResponse(res, [], "no data", "success", false, 200);
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

const dashboardUpcoming = async (req, res) => {
  try {
    let queryString = "";
    let currentDate = req.headers.currenttime;
    let currentStartDate = moment(currentDate)
      .utc()
      .startOf("day")
      .format("YYYY-MM-DD HH:mm:ss");
    let startTime = moment(currentStartDate)
      .add(req.headers.timevariationinsecond, "seconds")
      .format("YYYY-MM-DD HH:mm:ss");
    let endTime = moment(startTime)
      .add(4, "days")
      .format("YYYY-MM-DD HH:mm:ss");

    let IDoffatchData = [];

    let userRoomIds = [];

    let paymentLogId = [];
    let paymentData = [];

    let resData = [];

    if (req.query.filterData !== "" && req.query.filterData) {
      queryString =
        `AND (delivery.pickup_location LIKE '%${req.query.filterData}%' ` +
        `OR delivery.destination_location LIKE '%${req.query.filterData}%' ` +
        `OR driver.name LIKE '%${req.query.filterData}%' ` +
        `OR customer.name LIKE '%${req.query.filterData}%')`;
    }

    const count = await getRowQuery(
      "SELECT count(*) AS `count` FROM `deliveries` " +
        `AS delivery` +
        " LEFT OUTER JOIN users AS driver ON delivery.driver_id = driver.id" +
        " LEFT OUTER JOIN users AS customer ON delivery.user_id = customer.id " +
        ` WHERE (delivery.deletedAt IS NULL AND delivery.company_id = ${req.company_id} AND ` +
        `(delivery.expected_delivery_time BETWEEN '${startTime}' AND '${endTime}' ` +
        `AND delivery.status IN ('PICKEDUP', 'ASSIGNED') ${queryString}))`
    );

    const query =
      "SELECT delivery.expected_delivery_time, delivery.id," +
      " delivery.destination_location, delivery.pickup_location," +
      " delivery.status, delivery.total_price, " +
      " driver.name AS driver," +
      " customer.name AS customer, " +
      "room_users.room_id AS user_room_id,delivery.user_id" +
      " FROM deliveries AS delivery" +
      " LEFT OUTER JOIN users AS driver ON delivery.driver_id = driver.id" +
      " LEFT OUTER JOIN users AS customer ON delivery.user_id = customer.id " +
      "LEFT OUTER JOIN room_users AS room_users ON delivery.user_id = room_users.user_id LEFT JOIN rooms AS rooms ON rooms.id = room_users.room_id AND rooms.delivery_id IS null " +
      ` WHERE (delivery.deletedAt IS NULL AND delivery.company_id = ${req.company_id} AND ` +
      `(delivery.expected_delivery_time BETWEEN '${startTime}' AND '${endTime}' ` +
      `AND delivery.status IN ('PICKEDUP', 'ASSIGNED') ${queryString}))` +
      "GROUP BY delivery.id ORDER BY delivery.expected_delivery_time ASC " +
      `LIMIT ${(req.query.page - 1) * req.query.limit}, ${req.query.limit}`;

    const data = await getRowQuery(query);

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
        "SELECT delivery_payment_logs.delivery_id,delivery_payment_logs.payment_status, delivery_payment_logs.id FROM delivery_payment_logs" +
          ` WHERE (delivery_payment_logs.delivery_id IN (${paymentLogId}) ) ORDER BY updatedAt DESC;`
        // GROUP BY delivery_id
      );
    }

    data.forEach((e) => {
      let itemString;
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
        let IdIndexForPayment = paymentData.findIndex(
          (e1) => e.id === e1.delivery_id
        );
        if (IdIndexForPayment > -1) {
          e.payment_status = paymentData[IdIndexForPayment].payment_status;
        }
      }
      e.user_room = e.user_room_id;
      delete e.user_room_id;
      e.item_name = itemString;
    });
    if (count && count.length > 0) {
      resData.push({ rows: data, page: count[0].count });
    }

    return generalResponse(res, resData, "", "success", false, 200);
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

const dashboardPriceGraph = async (req, res) => {
  try {
    let resData = { month: [], data: [], max: 0, min: 0 };

    let startDate = moment(req.query.fromDate).format("YYYY-MM-DD");
    let endDate = moment(req.query.toDate).format("YYYY-MM-DD");

    if (startDate === endDate) {
      startDate = moment(startDate)
        .subtract(5, "month")
        .startOf("month")
        .format("YYYY-MM-DD");
    }

    const startMonth = moment(startDate).format("M");
    const startYear = moment(startDate).format("YYYY");

    const months = [
      "Dec",
      "Jan",
      "Feb",
      "March",
      "April",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    let graphQuery =
      "select year(expected_delivery_time) " +
      "as year, month(expected_delivery_time) as month ,sum(total_price) " +
      "as price from deliveries " +
      "LEFT OUTER JOIN delivery_payment_logs AS delivery_payment_log " +
      "ON delivery_payment_log.delivery_id = deliveries.id " +
      `WHERE company_id = ${req.company_id} AND expected_delivery_time between '${startDate}' and '${endDate}' ` +
      "and delivery_payment_log.payment_status = 'success' " +
      "group by year(expected_delivery_time),month(expected_delivery_time) " +
      "ORDER BY year(expected_delivery_time) ASC";

    const graphData = await getRowQuery(graphQuery);

    const lengthIndex = parseInt(
      moment(endDate)
        .endOf("month")
        .diff(moment(startDate).startOf("month"), "months")
    );
    for (let i = 0; i < Math.abs(lengthIndex) + 1; i++) {
      let dataIndex;
      let countExtra;
      countExtra = parseInt((i + parseInt(startMonth)) / 12);
      if (parseInt(startMonth) + i <= 12) {
        dataIndex = graphData.findIndex(
          (e) =>
            e.month == parseInt(startMonth) + i && e.year == parseInt(startYear)
        );
      } else {
        dataIndex = graphData.findIndex(
          (e) =>
            e.month == i + parseInt(startMonth) - 12 * countExtra &&
            e.year == parseInt(startYear) + countExtra
        );
      }
      if (dataIndex > -1) {
        resData.month.push(
          months[graphData[`${dataIndex}`].month] +
            " " +
            graphData[`${dataIndex}`].year
        );
        resData.data.push(
          graphData[`${dataIndex}`].price
            ? parseFloat(graphData[`${dataIndex}`].price).toFixed(2)
            : 0
        );
        resData.max =
          resData.max < graphData[`${dataIndex}`].price
            ? parseFloat(graphData[`${dataIndex}`].price).toFixed(2)
            : parseFloat(resData.max).toFixed(2);
        resData.min =
          resData.min > graphData[`${dataIndex}`].price
            ? parseFloat(graphData[`${dataIndex}`].price).toFixed(2)
            : parseFloat(resData.min).toFixed(2);
      } else {
        if (parseInt(startMonth) + i <= 12) {
          resData.month.push(
            months[i + parseInt(startMonth)] + " " + startYear
          );
        } else {
          resData.month.push(
            months[i + parseInt(startMonth) - 12 * countExtra] +
              " " +
              (parseInt(startYear) + countExtra)
          );
        }
        resData.data.push(0);
        resData.min = 0;
      }
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

const calenderData = async (req, res) => {
  try {
    let resData;
    let jsonData = [];

    const startTime = moment(parseInt(req.query.start) * 1000).add(
      req.headers.timevariationinsecond,
      "seconds"
    );
    const endTime = moment(parseInt(req.query.end) * 1000).add(
      req.headers.timevariationinsecond,
      "seconds"
    );
    let where;
    if (req.query.driver_id) {
      where = {
        company_id: req.company_id,
        expected_delivery_time: {
          [Op.between]: [moment(startTime), moment(endTime)],
        },
        driver_id: req.query.driver_id,
      };
    } else if (req.query.filterBy !== "" && req.query.user !== "") {
      if (req.query.filterBy === "by_customer") {
        where = {
          expected_delivery_time: {
            [Op.between]: [moment(startTime), moment(endTime)],
          },
          user_id: req.query.user,
          status: {
            [Op.in]: ["REQUESTED", "ASSIGNED", "PICKEDUP"],
          },
        };
      } else if (req.query.filterBy === "by_driver") {
        where = {
          expected_delivery_time: {
            [Op.between]: [moment(startTime), moment(endTime)],
          },
          driver_id: req.query.user,
          status: {
            [Op.in]: ["REQUESTED", "ASSIGNED", "PICKEDUP"],
          },
        };
      } else {
        where = {
          expected_delivery_time: {
            [Op.between]: [moment(startTime), moment(endTime)],
          },
          status: {
            [Op.in]: ["REQUESTED", "ASSIGNED", "PICKEDUP"],
          },
        };
      }
    } else {
      where = {
        expected_delivery_time: {
          [Op.between]: [moment(startTime), moment(endTime)],
        },
        status: {
          [Op.in]: ["REQUESTED", "ASSIGNED", "PICKEDUP"],
        },
      };
    }

    const relation = [
      {
        model: db.delivery_item,
        as: "delivery_items",
        required: false,
        attributes: ["item_quantity"],
        include: [
          {
            model: db.item,
            as: "item",
            paranoid: false,
            attributes: ["item_name"],
            required: false,
          },
        ],
      },
      {
        model: db.user,
        as: "driver",
        required: false,
        paranoid: false,
        attributes: ["name", "phone_number", "email"],
      },
      {
        model: db.user,
        as: "customer",
        paranoid: false,
        attributes: ["name", "phone_number", "email"],
        required: false,
      },
    ];

    const attribute = [
      "id",
      "pickup_location",
      "destination_location",
      "expected_delivery_time",
      "status",
    ];
    const data = await findAllDelivery({
      where,
      attributes: attribute,
      include: relation,
    });
    if (data && data !== null) {
      resData = JSON.parse(JSON.stringify(data));
      resData.map((e) => {
        jsonData.push({
          title: `${e.customer.name} - ${moment(
            e.expected_delivery_time
          ).format(" hh A")}`,
          start: moment(e.expected_delivery_time).utc().format("X"),
          end: moment(e.expected_delivery_time).utc().format("X"),
          pickup_time: moment(e.expected_delivery_time).format(
            "MM-DD-YYYY HH:mm"
          ),
          pickup_location: e.pickup_location,
          destination_location: e.destination_location,
          id: e.id,
          customer_name: e.customer.name,
          status: e.status,
          driver_name: e.driver ? e.driver.name : null,
        });
      });

      return generalResponse(res, jsonData, "", "success", false, 200);
    } else {
      return generalResponse(res, [], "", "success", false, 200);
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

const dashboradMessageList = async (req, res) => {
  try {
    // let date = moment().utc();
    // if (process.env.NODE_ENV === "development") {
    //   date = moment(req.headers.currenttime).toDate();
    // } else {
    //   date = moment(req.headers.currenttime)
    //     .subtract(req.headers.timevariationinsecond, "seconds")
    //     .toDate();
    // }

    // let end = moment(date).toDate();
    // let start = moment(end).subtract(1, "hours").toDate();

    let currentDate = req.headers.currenttime;
    let start = moment(currentDate).startOf("day").utc();
    let end = moment(currentDate).endOf("day").utc();

    // let start = moment(date.startOf("day")).toDate();
    // let end = moment(date.endOf("day")).toDate();

    // let attributes = [
    //   "sender_id",
    //   "message",
    //   "attachment",
    //   "createdAt",
    //   "room_id",
    //   "id",
    // ];
    // let where = {
    //   sender_id: { [Op.not]: req.user.id },
    //   createdAt: { [Op.between]: [start, end] },
    //   // read_status: 0,
    // };
    // let order = [["createdAt", "DESC"]];
    // let group = ["room_id"];
    // let relation = [
    //   {
    //     model: db.user,
    //     as: "user_messages_info",
    //     paranoid: false,
    //     attributes: ["name", "role", "image_path", "id"],
    //     required: false,
    //   },
    // ];
    // const data = await getMessagesChatForAdmin(
    //   where,
    //   order,
    //   attributes,
    //   relation,
    //   group
    // );

    let include = [
      {
        model: db.role,
        attributes: ["name"],
        required: true,
        paranoid: false,
        where: {
          name: ["admin"],
        },
      },
    ];

    let adminIds = await findAllCompanyUser({
      where: { company_id: req.company_id },
      include,
    });
    adminIds = JSON.parse(JSON.stringify(adminIds));
    adminIds = adminIds.map((e) => e.id);

    const sql =
      "SELECT `chat_message`.`sender_id`, `chat_message`.`message`, " +
      "`chat_message`.`attachment`, `chat_message`.`createdAt`," +
      " `chat_message`.`room_id`, `chat_message`.`id`," +
      " `user_messages_info`.`name` AS `user_messages_info.name`," +
      // " `company_users_messages_info`.`id` AS `company_users_messages_info.id`," +
      " `user_messages_info`.`image_path` AS `user_messages_info.image_path`," +
      " `user_messages_info`.`id` AS `user_messages_info.id` " +
      "FROM `chat_messages` AS `chat_message`" +
      " LEFT OUTER JOIN `users` AS `user_messages_info` ON `chat_message`.`sender_id` = `user_messages_info`.`id`" +
      " WHERE `chat_message`.`createdAt` IN (SELECT MAX(`createdAt`) FROM chat_messages" +
      " where `chat_message`.`sender_id` NOT IN  (" +
      `${adminIds}` +
      ") AND " +
      "`createdAt` BETWEEN " +
      `'${moment(start).format("YYYY-MM-DD HH:mm:ss")}' AND '${moment(
        end
      ).format("YYYY-MM-DD HH:mm:ss")}'` +
      " and deletedAt is NULL  GROUP BY `room_id`) order by createdAt desc";

    " LEFT OUTER JOIN `company_users` AS `company_users_messages_info` ON `user_messages_info`.`id` = `company_users_messages_info`.`user_id` AND `company_users_messages_info`.`company_id` =" +
      `${req.company_id}`;
    // " WHERE `chat_message`.`createdAt` IN (SELECT MAX(`createdAt`) FROM chat_messages" +
    // " where `chat_message`.`sender_id` != 1 AND " +
    // "`createdAt` BETWEEN " +
    // `'${moment(start).format("YYYY-MM-DD HH:mm:ss")}' AND '${moment(
    //   end
    // ).format("YYYY-MM-DD HH:mm:ss")}'` +
    // " and deletedAt is NULL  GROUP BY `room_id`) order by createdAt desc";
    const data = await getRowQuery(sql);

    if (data) {
      let resData = await data.map((e) => {
        return {
          sender_id: e.sender_id,
          message: e.message,
          attachment: e.attachment,
          createdAt: e.createdAt,
          room_id: e.room_id,
          id: e.id,
          user_messages_info: {
            name: e["user_messages_info.name"],
            role: e["user_messages_info.role"],
            image_path: e["user_messages_info.image_path"]
              ? e["user_messages_info.image_path"]
              : null,
            id: e["user_messages_info.id"],
          },
        };
      });
      return generalResponse(res, resData, "", "success", false, 200);
    } else {
      return generalResponse(res, [], "No data found", "success", false, 200);
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

module.exports = {
  deliveryCountDashboard,
  dashboardUpcoming,
  dashboardPriceGraph,
  calenderData,
  dashboradMessageList,
};
