const { findUser } = require("../repository/user.repository");
const generalResponse = require("./general_response.helper");
const { createCustomerAccount } = require("../stripe/createCustomerAccount");
const db = require("../models/");
const Sequelize = require("sequelize");
const { updateCompanyUser } = require("../repository/company_user.repository");
const Op = Sequelize.Op;

const createPaymentCustomer = async (req, res, next) => {
  try {
    const { user_id } = req.body;
    let stripeId;
    let customer = {};
    let jsonData;
    if (user_id) {
      let where = {
        id: user_id,
      };
      let attributes = ["id", "name", "email", "phone_number"];
      let include = [
        {
          model: db.company_user,
          required: false,
          where: {
            company_id: req.company_id,
          },
          attributes: ["id_number", "payment_customer_id", "id"],
          include: [
            {
              model: db.role,
              where: {
                name: "customer",
              },
              attributes: ["name"],
              paranoid: false,
            },
          ],
        },
      ];
      let data = await findUser({ where, attributes, include });
      data = JSON.parse(JSON.stringify(data));
      if (data && data.company_users && data.company_users.length !== 0) {
        data.id_number = data.company_users[0].id_number;
        data.payment_customer_id = data.company_users[0].payment_customer_id;
        data.company_user_id = data.company_users[0].id;
        data.role = data.company_users[0].role.name;
        delete data.company_users;
      }
      if (data && data.role === "customer") {
        jsonData = JSON.parse(JSON.stringify(data));
        stripeId = jsonData.payment_customer_id;
      }
    } else {
      if (req.user) {
        let where = {
          id: req.user.id,
        };
        let attributes = ["id", "name", "email", "phone_number"];
        let include = [
          {
            model: db.company_user,
            required: false,
            where: {
              company_id: req.company_id,
            },
            attributes: ["id_number", "payment_customer_id", "id"],
            include: [
              {
                model: db.role,
                where: {
                  name: "customer",
                },
                attributes: ["name"],
                paranoid: false,
              },
            ],
          },
        ];
        let data = await findUser({ where, attributes, include });
        data = JSON.parse(JSON.stringify(data));
        if (data && data.company_users && data.company_users.length !== 0) {
          data.id_number = data.company_users[0].id_number;
          data.payment_customer_id = data.company_users[0].payment_customer_id;
          data.company_user_id = data.company_users[0].id;
          data.role = data.company_users[0].role.name;
          delete data.company_users;
        }
        if (data && data.role === "customer") {
          jsonData = JSON.parse(JSON.stringify(data));
          stripeId = jsonData.payment_customer_id;
        } else {
          throw new Error("You are not able to create delivery");
        }
      } else {
        throw new Error("You are not able to create delivery");
      }
    }
    if (stripeId === null) {
      customer = {
        name: jsonData.name,
        email: jsonData.email,
        phone: jsonData.phone_number,
        description: "For Delivery",
      };
      const customerCreateRes = await createCustomerAccount(
        customer,
        req.company.stripe_account_id
      );
      if (customerCreateRes && customerCreateRes.id) {
        let updateData = { payment_customer_id: customerCreateRes.id };

        const response = await updateCompanyUser(updateData, {
          id: jsonData.company_user_id,
        });
        if (response[0]) {
          req.user.payment_customer_id = customerCreateRes.id;
          return next();
        }
      } else {
        throw new Error("Stripe id not created in customer");
      }
    } else {
      return next();
    }
  } catch (e) {
    console.log(e);
    return generalResponse(
      res,
      [],
      "Something went wrong",
      "error",
      false,
      200
    );
  }
};

module.exports = { createPaymentCustomer };
