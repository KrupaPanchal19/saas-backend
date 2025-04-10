const folderExistCheck = require("../../helper/folder_exist_check.helper");
const generalResponse = require("../../helper/general_response.helper");
const imageFilter = require("../../helper/image_filter.helper");
const randomFiveNumber = require("../../helper/random_five_number.helper");

const { sequelize } = require("../../models");
const db = require("../../models");

const { findUser, createUser } = require("../../repository/user.repository");
const { findRole } = require("../../repository/role.repository");
const {
  createCompanyUser,
  findCompanyUser,
  deleteCompanyUser,
} = require("../../repository/company_user.repository");
const { getRowQuery } = require("../../repository/row_query.repository");

const getAllStaff = async (req, res) => {
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
        ` INNER JOIN roles ON roles.id = company_users.role_id AND roles.name="admin" AND roles.deletedAt IS NULL` +
        ` INNER JOIN users on company_users.user_id=users.id AND users.deletedAt IS NULL` +
        ` WHERE company_users.company_id=${company_id} AND users.id != ${req.user.id} AND company_users.deletedAt IS NULL ${queryString}`
    );

    const dataRes = await getRowQuery(
      `SELECT users.id, users.name,users.email,users.phone_number,company_users.status FROM company_users` +
        ` INNER JOIN roles ON roles.id = company_users.role_id AND roles.name="admin" AND roles.deletedAt IS NULL` +
        ` INNER JOIN users on company_users.user_id=users.id AND users.deletedAt IS NULL` +
        ` WHERE company_users.company_id=${company_id} AND users.id != ${req.user.id} AND company_users.deletedAt IS NULL ${queryString} ` +
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

const getStaff = async (req, res) => {
  try {
    let company_id = req.company_id;
    const phoneCountryCodeArray = ["+1", "+91"];
    let user_id = req.params.id;
    let where = { id: user_id };
    const attributes = ["id", "name", "email", "phone_number", "image_path"];
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
              name: "admin",
            },
            required: true,
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

const createStaff = async (req, res) => {
  const update = Object.keys(req.body);
  const allowUpdate = [
    "id",
    "name",
    "email",
    "phone_number",
    "password",
    "status",
  ];
  const invalidOP = update.every((update) => allowUpdate.includes(update));
  if (!invalidOP) {
    return generalResponse(res, [], "Invalid operation!!", "error", true, 200);
  }

  if (req.body.email && (req.body.id === undefined || req.body.id === "")) {
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
    (req.body.id === undefined || req.body.id === "")
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
    const id_number = randomFiveNumber("a");
    const role = await findRole({
      where: { company_id: req.company_id, name: "admin" },
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
            "Your admin has already registered with another company",
            "error",
            true
          );
        }
        if (user) {
          await createCompanyUser(
            {
              company_id: req.company_id,
              role_id: role.id,
              user_id: user.id,
              id_number,
              status: req.body.status ? req.body.status : "ACTIVE",
            },
            t
          );
          await t.commit();
          return generalResponse(res, null, "Administrator added successfully");
        }
      }
    }
    const user = await createUser(
      {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        phone_number: req.body.phone_number,
        image_path,
      },
      t
    );

    await createCompanyUser(
      {
        company_id: req.company_id,
        role_id: role.id,
        user_id: user.id,
        id_number,
        status: req.body.status ? req.body.status : "ACTIVE",
      },
      t
    );
    await t.commit();
    return generalResponse(res, null, "Administrator added successfully");
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

const deleteStaff = async (req, res) => {
  const id = req.params.id;
  try {
    let where = { user_id: id, company_id: req.company_id };

    const attributes = ["id"];
    let include = [
      {
        model: db.role,
        attributes: ["name"],
        required: true,
      },
    ];

    const data = await findCompanyUser({ where, attributes, include });

    if (data.role.name === "staff") {
      await deleteCompanyUser({ id: data.id });
      return generalResponse(res, [], "staff delete successfully");
    } else {
      return generalResponse(
        res,
        [],
        "don't have permission to delete admin",
        "error",
        true
      );
    }
  } catch (e) {
    return generalResponse(res, [], "something wrong", "error");
  }
};

module.exports = { getAllStaff, createStaff, getStaff, deleteStaff };
