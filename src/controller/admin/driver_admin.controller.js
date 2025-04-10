const folderExistCheck = require("../../helper/folder_exist_check.helper");
const generalResponse = require("../../helper/general_response.helper");
const imageFilter = require("../../helper/image_filter.helper");
const randomFiveNumber = require("../../helper/random_five_number.helper");
const moment = require("moment");

const { sequelize } = require("../../models");
const db = require("../../models");

const {
  findUser,
  createUser,
  findAllUser,
  updateUser,
} = require("../../repository/user.repository");
const { findRole } = require("../../repository/role.repository");
const {
  createCompanyUser,
  updateCompanyUser,
  findCompanyUser,
  deleteCompanyUser,
} = require("../../repository/company_user.repository");
const { getRowQuery } = require("../../repository/row_query.repository");
const {
  createDriverCarInfo,
  deleteDriverCarInfo,
} = require("../../repository/driver_car_info.repository");
const {
  findDelivery,
  findAllDelivery,
} = require("../../repository/delivery.repository");

const getAllDriver = async (req, res) => {
  try {
    let company_id = req.company_id;
    let data = [];
    let queryString = "";

    const offset = (req.query.page - 1) * 10;
    if (req.query.filterData !== "" && req.query.filterData) {
      queryString =
        `AND (users.name LIKE '%${req.query.filterData}%' ` +
        `OR users.email LIKE '%${req.query.filterData}%' ` +
        `OR users.phone_number LIKE '%${req.query.filterData}%')`;
    }

    const count = await getRowQuery(
      `SELECT count(*) AS count FROM company_users` +
        ` INNER JOIN roles ON roles.id = company_users.role_id AND roles.name="driver" AND roles.deletedAt IS NULL` +
        ` INNER JOIN users on company_users.user_id=users.id AND users.deletedAt IS NULL` +
        ` WHERE company_users.company_id=${company_id} AND company_users.deletedAt IS NULL ${queryString}`
    );

    const dataRes = await getRowQuery(
      `SELECT users.id, users.name,users.email,users.phone_number,users.driver_cdl_license,company_users.status, AVG(reviews.rate) AS rating , COUNT(completed_delivery.id) AS complete_delivery FROM company_users ` +
        ` INNER JOIN roles ON roles.id = company_users.role_id AND roles.name="driver" AND roles.deletedAt IS NULL` +
        ` INNER JOIN users on company_users.user_id=users.id AND users.deletedAt IS NULL` +
        ` LEFT OUTER JOIN deliveries as completed_delivery ON company_users.user_id = completed_delivery.driver_id  AND completed_delivery.status IN  ('COMPLETED','REVIEWED')` +
        ` LEFT OUTER JOIN delivery_reviews as reviews ON completed_delivery.id = reviews.delivery_id ` +
        ` WHERE company_users.company_id=${company_id} AND company_users.deletedAt IS NULL ${queryString} ` +
        `GROUP BY company_users.user_id ORDER BY users.name ASC LIMIT ${offset}, 10`
    );

    if (count && count.length > 0) {
      data.push({ count: count[0].count, rows: dataRes });
    }
    return generalResponse(res, data);
  } catch (e) {
    return generalResponse(
      res,
      e,
      "Something went wrong!!",
      "error",
      false,
      200
    );
  }
};

const getDriver = async (req, res) => {
  try {
    let company_id = req.company_id;
    const phoneCountryCodeArray = ["+1", "+91"];
    let user_id = req.params.id;
    let where = { id: user_id };
    const attributes = [
      "id",
      "name",
      "email",
      "phone_number",
      "image_path",
      "driver_cdl_license",
      "zip_code",
      "driver_need_helper",
    ];
    let include = [
      {
        model: db.company_user,
        attributes: ["status"],
        where: { company_id },
        include: [
          {
            model: db.role,
            attributes: [],
            where: {
              name: "driver",
            },
            required: true,
          },
          {
            model: db.driver_car_info,
            attributes: ["car_model", "car_type", "car_color", "id"],
            required: false,
          },
        ],
        required: true,
      },
    ];

    const user = await findUser({ where, attributes, include });
    let jsonData = JSON.parse(JSON.stringify(user));
    Object.keys(jsonData).forEach((element) => {
      if (jsonData[element] === null) {
        delete jsonData[element];
      }
    });
    jsonData.status = jsonData.company_users[0].status;
    jsonData.car_info = jsonData.company_users[0].driver_car_infos;
    delete jsonData.company_users;
    if (jsonData.hasOwnProperty("phone_number")) {
      let prefix;
      phoneCountryCodeArray.forEach((e) => {
        if (jsonData.phone_number.startsWith(e)) {
          prefix = e;
        }
      });
      jsonData.phone_country_code = prefix;
      jsonData.phone_number = jsonData.phone_number.slice(prefix.length);
    }
    return generalResponse(res, jsonData);
  } catch (e) {
    console.log(e);
    return generalResponse(
      res,
      e,
      "Something went wrong!!",
      "error",
      false,
      200
    );
  }
};

const createDriver = async (req, res) => {
  const update = Object.keys(req.body);
  const allowUpdate = [
    "id",
    "name",
    "email",
    "phone_number",
    "driver_cdl_license",
    "driver_need_helper",
    "zip_code",
    "status",
    "password",
    "car_info",
  ];
  const invalidOP = update.every((update) => allowUpdate.includes(update));
  if (!invalidOP) {
    return generalResponse(res, [], "Invalid operation!!", "error", true, 200);
  }

  if (
    req.body.email &&
    (req.body.id === undefined ||
      req.body.id === "undefined" ||
      req.body.id === "" ||
      req.body.id === -1)
  ) {
    const user = await findUser({
      where: {
        email: req.body.email,
      },
    });
    if (user) {
      return generalResponse(
        res,
        null,
        "Please enter another email because this email is already exist!!",
        "error",
        true,
        200
      );
    }
  }
  if (
    req.body.phone_number &&
    (req.body.id === undefined ||
      req.body.id === "undefined" ||
      req.body.id === "" ||
      req.body.id === -1)
  ) {
    const user = await findUser({
      where: {
        phone_number: req.body.phone_number,
      },
    });

    if (user) {
      return generalResponse(
        res,
        null,
        "Please enter another phone number because this phone number is already in use!",
        "error",
        true,
        200
      );
    }
  }

  const t = await sequelize.transaction();

  try {
    const id_number = randomFiveNumber("d");
    const carData = JSON.parse(req.body.car_info);
    const role = await findRole({
      where: { company_id: req.company_id, name: "driver" },
      transaction: t,
    });
    let image_path = null;
    if (req.files !== null) {
      let file = req.files.image_path;
      let fileName = file.name.replace(/\s/g, "_");
      const fileExtRes = imageFilter(fileName);
      if (fileExtRes === true) {
        const current_date = new Date();
        let seconds = Math.round(current_date.getTime() / 1000);
        let filename = seconds + "_" + fileName;
        const folderCheck = folderExistCheck(`./public/userProfile/`);
        if (folderCheck) {
          image_path = `/userProfile/${filename}`;
          file.mv(`./public/userProfile/${filename}`, async (err) => {
            if (err) {
              throw new Error("file not move in folder");
            }
          });
        }
      }
    }
    if (req.body.id) {
      const user = await findUser({
        where: { id: req.body.id },
        include: [
          {
            model: db.company_user,
            include: [
              {
                model: db.role,
                required: true,
              },
            ],
            required: false,
          },
        ],
        transaction: t,
      });
      if (user) {
        if (user.company_users.length > 0) {
          return generalResponse(
            res,
            null,
            "Your driver has already registered with another company",
            "error",
            true
          );
        }
        const company_user = await createCompanyUser(
          {
            company_id: req.company_id,
            role_id: role.id,
            user_id: user.id,
            id_number,
            status: req.body.status ? req.body.status : "ACTIVE",
          },
          t
        );
        carData.map((e, index) => {
          carData[index] = { ...e, company_user_id: company_user.id };
        });
        await createDriverCarInfo(carData, t);
        await t.commit();
        return generalResponse(res, null, "driver added successfully");
      }
    }
    const user = await createUser(
      {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        phone_number: req.body.phone_number,
        driver_cdl_license: req.body.driver_cdl_license
          ? req.body.driver_cdl_license
          : null,
        zip_code: req.body.zip_code ? req.body.zip_code : null,
        driver_need_helper: req.body.driver_need_helper
          ? req.body.driver_need_helper
          : null,
        image_path,
      },
      t
    );

    const company_user = await createCompanyUser(
      {
        company_id: req.company_id,
        role_id: role.id,
        user_id: user.id,
        id_number,
        status: req.body.status ? req.body.status : "ACTIVE",
      },
      t
    );
    carData.map((e, index) => {
      carData[index] = { ...e, company_user_id: company_user.id };
    });
    await createDriverCarInfo(carData, t);
    await t.commit();
    return generalResponse(res, null, "driver added successfully");
  } catch (e) {
    console.log(e);
    t.rollback();
    return generalResponse(
      res,
      e,
      "Something went wrong!!",
      "error",
      false,
      200
    );
  }
};

const getAllDriverCombo = async (req, res) => {
  try {
    let company_id = req.company_id;
    const attributes = ["id", "name"];
    let include = [
      {
        model: db.company_user,
        attributes: [],
        where: { company_id, status: "ACTIVE" },
        include: [
          {
            model: db.role,
            attributes: [],
            where: { name: "driver" },
            require: true,
          },
        ],
      },
    ];
    const userData = await findAllUser({ attributes, include });
    const jsonUserData = JSON.parse(JSON.stringify(userData));
    let resData = jsonUserData.map((e) => ({ label: e.name, value: e.id }));
    return generalResponse(res, resData);
  } catch (e) {
    return generalResponse(
      res,
      e,
      "Something went wrong!!",
      "error",
      false,
      200
    );
  }
};

const editDriver = async (req, res) => {
  // const update = Object.keys(req.body);
  // const allowUpdate = [
  //   "id",
  //   "name",
  //   "email",
  //   "phone_number",
  //   "image_path",
  //   "driver_cdl_licence",
  //   "driver_need_helper",
  //   "driver_zipcode",
  //   "status",
  //   "role",
  //   "password",
  //   "car_info",
  //   "image",
  // ];
  // const invalidedOP = update.every((update) => allowUpdate.includes(update));
  // if (!invalidedOP) {
  //   return generalResponse(res, [], "invalided operation", "error");
  // }
  try {
    const { status, car_info, id, ...rest } = req.body;
    const carData = JSON.parse(car_info);

    const company_user = await findCompanyUser({
      where: { user_id: id, company_id: req.company_id },
      attributes: ["id"],
    });

    const company_user_id = company_user.id;

    console.log(company_user_id, "company_user_id");

    if (req.files !== null) {
      // if (image_path !== "undefined") {
      //   fs.unlinkSync(`./public${image_path}`);
      // }
      let file = req.files.image_path;
      let fileName = file.name.replace(/\s/g, "_");
      const fileExtRes = imageFilter(fileName);
      if (fileExtRes === true) {
        const current_date = new Date();
        let seconds = Math.round(current_date.getTime() / 1000);
        let filename = seconds + "_" + fileName;
        const folderCheck = folderExistCheck(`./public/driverProfile/`);
        if (folderCheck) {
          file.mv(`./public/driverProfile/${filename}`, async (err) => {
            if (err) {
              return generalResponse(
                res,
                [],
                "driver not inserted",
                "error",
                true
              );
            } else {
              const image_path = {
                image_path: `/driverProfile/${filename}`,
              };
              await updateUser({ image_path }, { id });
              await updateCompanyUser({ status }, { id: company_user_id });
              await deleteDriverCarInfo({ where: { company_user_id } });
              carData.map((e, index) => {
                if (!e.id) {
                  carData[index] = { ...e, company_user_id };
                } else {
                  delete carData[index].id;
                  carData[index] = { ...e, company_user_id };
                }
              });
              await createDriverCarInfo(carData);

              return generalResponse(res, [], "update driver successfully");
            }
          });
        }
      } else {
        return generalResponse(
          res,
          [],
          "Only image files are allowed like jpg,jpeg or png!",
          "error",
          true,
          200
        );
      }
    }
    await updateCompanyUser({ status }, { id: company_user_id });
    await deleteDriverCarInfo({ where: { company_user_id } });
    carData.map((e, index) => {
      if (!e.id) {
        carData[index] = { ...e, company_user_id };
      } else {
        delete carData[index].id;
        carData[index] = { ...e, company_user_id };
      }
    });
    await createDriverCarInfo(carData);
    return generalResponse(res, [], "update driver successfully");
  } catch (e) {
    console.log(e);
    return generalResponse(res, [], "something wrong", "error");
  }
};

///view driver page

const driverViewReview = async (req, res) => {
  try {
    let resData = [];
    //review

    const review = await getRowQuery(
      "SELECT AVG(delivery_reviews.rate) AS average_rate" +
        " FROM delivery_reviews" +
        " LEFT JOIN deliveries ON deliveries.id = delivery_reviews.delivery_id " +
        `WHERE deliveries.driver_id = ${req.query.id}`
    );
    resData.push({ status: "average_review", rate: review[0].average_rate });
    return generalResponse(res, resData, "");
  } catch (e) {
    return generalResponse(
      res,
      [],
      // "Something went wrong!!",
      e,
      "error",
      false,
      200
    );
  }
};

const driverViewAssigned = async (req, res) => {
  try {
    let resData = [];

    //for assigned delivery
    let data1;
    let IDoffatchData1 = [];
    let queryString = "";
    let itemData1 = [];

    if (req.query.filterData !== "" && req.query.filterData) {
      queryString =
        `AND (delivery.pickup_location LIKE '%${req.query.filterData}%' ` +
        `OR delivery.destination_location LIKE '%${req.query.filterData}%' ` +
        `OR driver.name LIKE '%${req.query.filterData}%' ` +
        `OR customer.name LIKE '%${req.query.filterData}%' ` +
        `OR created_by.name LIKE '%${req.query.filterData}%' ` +
        `OR item.item_name LIKE '%${req.query.filterData}%')`;
    }
    data1 = await getRowQuery(
      "SELECT delivery.id,delivery.pickup_location, delivery.destination_location," +
        "delivery.expected_delivery_time,driver.name AS driver_name," +
        "customer.name AS customer_name,created_by.name AS createdAt_name" +
        " FROM deliveries AS delivery " +
        "LEFT OUTER JOIN users AS customer ON delivery.user_id = customer.id " +
        " LEFT OUTER JOIN users AS driver ON delivery.driver_id = driver.id " +
        " LEFT OUTER JOIN users AS created_by ON delivery.createdBy = created_by.id " +
        " LEFT JOIN delivery_items AS delivery_item ON delivery.id = delivery_item.delivery_id AND (delivery_item.deletedAt IS NULL)" +
        " LEFT OUTER JOIN items AS item ON delivery_item.item_id = item.id " +
        ` WHERE (delivery.deletedAt IS NULL AND (delivery.driver_id = ${
          req.query.id
        } AND (delivery.status = 'ASSIGNED' OR delivery.status = 'PICKEDUP') ${queryString}))GROUP BY delivery.id ORDER BY delivery.updatedAt DESC LIMIT ${
          (req.query.page - 1) * 10
        }, 10`
    );
    data1.forEach((e) => IDoffatchData1.push(e.id));
    if (IDoffatchData1.length > 0) {
      itemData1 = await getRowQuery(
        "SELECT delivery_items.delivery_id, item.item_name AS item_name FROM delivery_items" +
          " LEFT OUTER JOIN items AS item ON delivery_items.item_id = item.id AND (item.deletedAt IS NULL)" +
          ` WHERE (delivery_items.deletedAt IS NULL AND delivery_items.delivery_id IN (${IDoffatchData1}) )`
      );
    }

    const assigned = [];
    data1.forEach((e) => {
      let data = {};
      let itemString;
      data.id = e.id;
      data.address = e.pickup_location + " To " + e.destination_location;
      data.expected_delivery_time = e.expected_delivery_time;
      if (e.customer_name !== null) {
        data.customer = e.customer_name;
      }
      if (e.driver_name !== null) {
        data.driver_name = e.driver_name;
      }
      if (e.createdAt_name !== null) {
        data.created_by = e.createdAt_name;
      }
      if (itemData1.length > 0) {
        itemData1.filter(function (val, i, arr) {
          val.delivery_id === e.id
            ? itemString === undefined
              ? (itemString = val.item_name)
              : (itemString += "," + val.item_name)
            : "";
        });
      }
      data.item_name = itemString;
      assigned.push(data);
    });
    const pageDataAssigned = await getRowQuery(
      "SELECT  COUNT(delivery.id) AS count From deliveries AS delivery " +
        "LEFT OUTER JOIN users AS customer ON delivery.user_id = customer.id " +
        " LEFT OUTER JOIN users AS driver ON delivery.driver_id = driver.id " +
        " LEFT OUTER JOIN users AS created_by ON delivery.createdBy = created_by.id " +
        " LEFT JOIN delivery_items AS delivery_item ON delivery.id = delivery_item.delivery_id AND (delivery_item.deletedAt IS NULL)" +
        " LEFT OUTER JOIN items AS item ON delivery_item.item_id = item.id " +
        ` WHERE (delivery.deletedAt IS NULL AND (delivery.driver_id = ${req.query.id} AND (delivery.status = 'ASSIGNED' OR delivery.status = 'PICKEDUP') ${queryString})) GROUP BY delivery.id`
    );
    resData.push({
      status: "ASSIGNED",
      rows: assigned,
      page: pageDataAssigned.length,
    });
    return generalResponse(res, resData, "");
  } catch (e) {
    return generalResponse(res, [], e, "error", false, 200);
  }
};

const driverViewCompleted = async (req, res) => {
  try {
    let resData = [];

    //for completed
    let data;
    let IDoffatchData = [];
    let queryString = "";
    let itemData = [];

    if (req.query.filterData !== "" && req.query.filterData) {
      queryString =
        `AND (delivery.pickup_location LIKE '%${req.query.filterData}%' ` +
        `OR delivery.destination_location LIKE '%${req.query.filterData}%' ` +
        `OR driver.name LIKE '%${req.query.filterData}%' ` +
        `OR customer.name LIKE '%${req.query.filterData}%' ` +
        `OR created_by.name LIKE '%${req.query.filterData}%' ` +
        `OR item.item_name LIKE '%${req.query.filterData}%')`;
    }

    data = await getRowQuery(
      "SELECT delivery.id,delivery.pickup_location, delivery.destination_location," +
        "delivery.expected_delivery_time,driver.name AS driver_name," +
        "customer.name AS customer_name,created_by.name AS createdAt_name" +
        " FROM deliveries AS delivery " +
        "LEFT OUTER JOIN users AS customer ON delivery.user_id = customer.id " +
        " LEFT OUTER JOIN users AS driver ON delivery.driver_id = driver.id " +
        " LEFT OUTER JOIN users AS created_by ON delivery.createdBy = created_by.id " +
        " LEFT JOIN delivery_items AS delivery_item ON delivery.id = delivery_item.delivery_id AND (delivery_item.deletedAt IS NULL)" +
        " LEFT OUTER JOIN items AS item ON delivery_item.item_id = item.id " +
        ` WHERE (delivery.deletedAt IS NULL AND (delivery.driver_id = ${
          req.query.id
        } AND (delivery.status = 'REVIEWED' OR delivery.status = 'COMPLETED') ${queryString}))GROUP BY  delivery.id ORDER BY delivery.expected_delivery_time DESC LIMIT ${
          (req.query.page - 1) * 10
        }, 10`
    );

    data.forEach((e) => IDoffatchData.push(e.id));
    if (IDoffatchData.length > 0) {
      itemData = await getRowQuery(
        "SELECT delivery_items.delivery_id, item.item_name AS item_name FROM delivery_items" +
          " LEFT OUTER JOIN items AS item ON delivery_items.item_id = item.id AND (item.deletedAt IS NULL)" +
          ` WHERE (delivery_items.deletedAt IS NULL AND delivery_items.delivery_id IN (${IDoffatchData}) )`
      );
    }

    const completed = [];
    data.forEach((e) => {
      let data = {};
      let itemString;
      data.id = e.id;
      data.address = e.pickup_location + " To " + e.destination_location;
      data.expected_delivery_time = e.expected_delivery_time;
      if (e.customer_name !== null) {
        data.customer = e.customer_name;
      }
      if (e.driver_name !== null) {
        data.driver_name = e.driver_name;
      }
      if (e.createdAt_name !== null) {
        data.created_by = e.createdAt_name;
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
      data.item_name = itemString;
      completed.push(data);
    });
    const pageDataCompleted = await getRowQuery(
      "SELECT  COUNT(delivery.id) AS count From deliveries AS delivery " +
        "LEFT OUTER JOIN users AS customer ON delivery.user_id = customer.id " +
        " LEFT OUTER JOIN users AS driver ON delivery.driver_id = driver.id " +
        " LEFT OUTER JOIN users AS created_by ON delivery.createdBy = created_by.id " +
        " LEFT JOIN delivery_items AS delivery_item ON delivery.id = delivery_item.delivery_id AND (delivery_item.deletedAt IS NULL)" +
        " LEFT OUTER JOIN items AS item ON delivery_item.item_id = item.id " +
        ` WHERE (delivery.deletedAt IS NULL AND (delivery.driver_id = ${req.query.id} AND (delivery.status = 'REVIEWED' OR delivery.status = 'COMPLETED') ${queryString})) GROUP BY delivery.id`
    );
    resData.push({
      status: "COMPLETED",
      rows: completed,
      page: pageDataCompleted.length,
    });
    return generalResponse(res, resData, "");
  } catch (e) {
    return generalResponse(
      res,
      [],
      // "Something went wrong!!",
      e,
      "error",
      false,
      200
    );
  }
};

const driverViewUpcoming = async (req, res) => {
  try {
    let resData = [];

    //for upcoming delivery
    let currentDate = req.headers.currenttime;
    let currentStartDate = moment(currentDate)
      .utc()
      .startOf("day")
      .format("YYYY-MM-DD HH:mm:ss");
    console.log(currentStartDate, "currentStartDate");
    let start = moment(currentStartDate)
      .add(req.headers.timevariationinsecond, "seconds")
      .format("YYYY-MM-DD HH:mm:ss");
    let end = moment(start).add(4, "days").format("YYYY-MM-DD HH:mm:ss");
    let data1;
    let IDoffatchData1 = [];
    let queryString = "";
    let itemData1 = [];

    if (req.query.filterData !== "" && req.query.filterData) {
      queryString =
        `AND (delivery.pickup_location LIKE '%${req.query.filterData}%' ` +
        `OR delivery.destination_location LIKE '%${req.query.filterData}%' ` +
        `OR driver.name LIKE '%${req.query.filterData}%' ` +
        `OR customer.name LIKE '%${req.query.filterData}%' ` +
        `OR created_by.name LIKE '%${req.query.filterData}%' ` +
        `OR item.item_name LIKE '%${req.query.filterData}%')`;
    }
    data1 = await getRowQuery(
      "SELECT delivery.id,delivery.pickup_location, delivery.destination_location," +
        "delivery.expected_delivery_time,driver.name AS driver_name," +
        "customer.name AS customer_name,created_by.name AS createdAt_name" +
        " FROM deliveries AS delivery " +
        "LEFT OUTER JOIN users AS customer ON delivery.user_id = customer.id " +
        " LEFT OUTER JOIN users AS driver ON delivery.driver_id = driver.id " +
        " LEFT OUTER JOIN users AS created_by ON delivery.createdBy = created_by.id " +
        " LEFT JOIN delivery_items AS delivery_item ON delivery.id = delivery_item.delivery_id AND (delivery_item.deletedAt IS NULL)" +
        " LEFT OUTER JOIN items AS item ON delivery_item.item_id = item.id " +
        ` WHERE (delivery.deletedAt IS NULL AND (delivery.driver_id = ${
          req.query.id
        } AND (delivery.status = 'ASSIGNED' OR delivery.status = 'PICKEDUP') AND delivery.expected_delivery_time between '${start}' and '${end}' ${queryString}))GROUP BY delivery.id ORDER BY delivery.expected_delivery_time DESC LIMIT ${
          (req.query.page - 1) * 10
        }, 10`
    );
    data1.forEach((e) => IDoffatchData1.push(e.id));
    if (IDoffatchData1.length > 0) {
      itemData1 = await getRowQuery(
        "SELECT delivery_items.delivery_id, item.item_name AS item_name FROM delivery_items" +
          " LEFT OUTER JOIN items AS item ON delivery_items.item_id = item.id AND (item.deletedAt IS NULL)" +
          ` WHERE (delivery_items.deletedAt IS NULL AND delivery_items.delivery_id IN (${IDoffatchData1}) )`
      );
    }

    const upcoming = [];
    data1.forEach((e) => {
      let data = {};
      let itemString;
      data.id = e.id;
      data.address = e.pickup_location + " To " + e.destination_location;
      data.expected_delivery_time = e.expected_delivery_time;
      if (e.customer_name !== null) {
        data.customer = e.customer_name;
      }
      if (e.driver_name !== null) {
        data.driver_name = e.driver_name;
      }
      if (e.createdAt_name !== null) {
        data.created_by = e.createdAt_name;
      }
      if (itemData1.length > 0) {
        itemData1.filter(function (val, i, arr) {
          val.delivery_id === e.id
            ? itemString === undefined
              ? (itemString = val.item_name)
              : (itemString += "," + val.item_name)
            : "";
        });
      }
      data.item_name = itemString;
      upcoming.push(data);
    });
    const pageDataUpcoming = await getRowQuery(
      "SELECT  COUNT(delivery.id) AS count From deliveries AS delivery " +
        "LEFT OUTER JOIN users AS customer ON delivery.user_id = customer.id " +
        " LEFT OUTER JOIN users AS driver ON delivery.driver_id = driver.id " +
        " LEFT OUTER JOIN users AS created_by ON delivery.createdBy = created_by.id " +
        " LEFT JOIN delivery_items AS delivery_item ON delivery.id = delivery_item.delivery_id AND (delivery_item.deletedAt IS NULL)" +
        " LEFT OUTER JOIN items AS item ON delivery_item.item_id = item.id " +
        ` WHERE (delivery.deletedAt IS NULL AND (delivery.driver_id = ${req.query.id} AND (delivery.status = 'ASSIGNED' OR delivery.status = 'PICKEDUP') AND delivery.expected_delivery_time between '${start}' and '${end}' ${queryString})) GROUP BY delivery.id`
    );
    resData.push({
      status: "UPCOMING",
      rows: upcoming,
      page: pageDataUpcoming.length,
    });
    return generalResponse(res, resData, "");
  } catch (e) {
    console.log(e, "error..................");
    return generalResponse(res, [], e, "error", false, 200);
  }
};

///// delete driver

const deleteDriver = async (req, res) => {
  const Op = db.Sequelize.Op;
  const id = req.params.id;
  try {
    const data = await findCompanyUser({
      where: { user_id: id, company_id: req.company_id },
      include: [
        {
          model: db.role,
          attributes: ["name"],
        },
      ],
    });

    const deliveryResponse = await findAllDelivery({
      where: {
        driver_id: id,
        status: {
          [Op.not]: ["COMPLETED", "REVIEWED"],
        },
      },
      attributes: ["id"],
    });
    if (data.role.name === "driver" && deliveryResponse.length === 0) {
      await deleteCompanyUser({ id: data.id });
      return generalResponse(res, [], "driver delete successfully");
    } else {
      return generalResponse(
        res,
        [],
        "Not able to delete driver because this driver has pending delivery",
        "error",
        true
      );
    }
  } catch (e) {
    console.log(e, "error..........");
    return generalResponse(res, [], "something wrong", "error");
  }
};

module.exports = {
  getAllDriver,
  createDriver,
  getDriver,
  getAllDriverCombo,
  editDriver,
  driverViewReview,
  driverViewAssigned,
  driverViewCompleted,
  driverViewUpcoming,
  deleteDriver,
};
