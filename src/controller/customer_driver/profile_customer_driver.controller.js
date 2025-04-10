const generalResponse = require("../../helper/general_response.helper");
const { findCompanyUser } = require("../../repository/company_user.repository");
const {
  findDriverCarInfo,
} = require("../../repository/driver_car_info.repository");
const { findAllPrice } = require("../../repository/price.repository");

// const { getUser, getUserWithRelation } = require("../../repository/user");
// const { getPriceByKey } = require("../../repository/price");
const { findRole } = require("../../repository/role.repository");
const { findUser } = require("../../repository/user.repository");
require("dotenv").config();
const db = require("../../models");

const getCustomer = async (req, res) => {
  const user = req["user"];
  const id = user.id;

  const company_user = await findCompanyUser({
    where: { company_id: req.company_id, user_id: id },
    include: [
      {
        model: db.role,
        attributes: ["name", "id"],
      },
    ],
  });

  let role = company_user.role.name;
  let company_user_id = company_user.id;
  let whereCondition = { id };
  let attributes;
  let data = {};
  try {
    if (role === "customer") {
      attributes = ["name", "email", "phone_number", "image_path", "address"];
      let include = [
        {
          model: db.company_user,
          attributes: ["id", "payment_customer_id"],
          where: { company_id: req.company_id },
        },
      ];

      data = await findUser({ where: whereCondition, include, attributes });
      data = JSON.parse(JSON.stringify(data));
      data.payment_customer_id = data.company_users[0]?.payment_customer_id;
      delete data.company_users;
    } else if (role === "driver") {
      attributes = [
        "name",
        "email",
        "phone_number",
        "image_path",
        "driver_cdl_license",
      ];

      data = await findUser({ where: whereCondition, attributes });

      let car = await findDriverCarInfo({
        where: { company_user_id: company_user_id },
        attributes: ["car_model", "car_type", "car_color"],
      });
      data = JSON.parse(JSON.stringify(data));
      data.car_info = JSON.parse(JSON.stringify(car));
    }
    if (data !== null) {
      const jsonData = JSON.parse(JSON.stringify(data));
      jsonData.role = role;
      jsonData.role_id = company_user.role.id;
      jsonData.id_number = company_user.id_number;
      jsonData.status = company_user.status;

      Object.keys(jsonData).forEach((element) => {
        if (jsonData[element] === null) {
          delete jsonData[element];
        } else if (element === "image_path" && jsonData[element] !== null) {
          jsonData["image_path"] = jsonData["image_path"];
        }
      });
      if (role === "customer") {
        jsonData.privateKey = process.env.STRIPE_PRIVATE_KEY;
        jsonData.publicKey = process.env.STRIPE_PUBLIC_KEY;
        jsonData.stripe_account_id = req.company.stripe_account_id;
      }
      return generalResponse(res, jsonData);
    } else {
      return generalResponse(res, [], "No data found!!", "success", true, 200);
    }
  } catch (e) {
    console.log(e);
    return generalResponse(
      res,
      [],
      "Something Went Wrong!!",
      "error",
      false,
      200
    );
  }
};

module.exports = { getCustomer };
