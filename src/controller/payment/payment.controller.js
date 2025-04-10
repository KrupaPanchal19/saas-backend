const generalResponse = require("../../helper/general_response.helper");
const { findDelivery } = require("../../repository/delivery.repository");

const { paymentMethodList } = require("../../stripe/paymentMethodList");
const { retrievePaymentIntent } = require("../../stripe/retrievePaymentIntent");

const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const db = require("../../models/");

const getPaymentInfo = async (req, res) => {
  try {
    const delivery_id = req.tokenInfo.delivery_id;
    let where = {
      id: delivery_id,
    };
    let attribute = [
      "item_heavy",
      "destination_type",
      "destination_stair_info",
      "pickup_location",
      "destination_location",
      "expected_delivery_time",
      "pickup_type",
      "expected_drop_off_delivery_time",
      "store_name",
      "total_price",
      "total_info",
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
            attributes: ["item_name", "item_image"],
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
          payment_status: { [Op.in]: ["pending", "success"] },
          delivery_id,
        },
      },
      {
        model: db.user,
        as: "customer",
        required: true,
        attributes: ["phone_number", "email", "name", "address", "image_path"],
        include: [
          {
            model: db.company_user,
            attributes: ["payment_customer_id"],
            where: {
              company_id: req.tokenInfo.delivery.company_id,
            },
            require: true,
            paranoid: false,
            include: [
              {
                model: db.company,
                attributes: ["stripe_account_id"],
                require: true,
              },
            ],
          },
        ],
      },
      {
        model: db.user,
        as: "driver",
        required: false,
        attributes: ["phone_number", "email", "name", "address", "image_path"],
      },
    ];
    const data = await findDelivery({
      where,
      include: relation,
      attributes: attribute,
    });
    const jsonData = JSON.parse(JSON.stringify(data));
    const paymentMethods = await paymentMethodList(
      jsonData.customer.company_users[0].payment_customer_id,
      jsonData.customer.company_users[0].company.stripe_account_id
    );
    const details = await retrievePaymentIntent(
      jsonData.delivery_payment_log[0].transaction_id,
      jsonData.customer.company_users[0].company.stripe_account_id
    );
    return generalResponse(
      res,
      {
        delivery: jsonData,
        card: paymentMethods,
        publicKey: process.env.STRIPE_PUBLIC_KEY,
        privateKey: process.env.STRIPE_PRIVATE_KEY,
        client_secret: details.client_secret,
        company_stripe_account:
          jsonData.customer.company_users[0].company.stripe_account_id,
      },
      "",
      "success",
      true,
      200
    );
  } catch (e) {
    return generalResponse(res, [], "something went wrong", "error", true, 200);
  }
};
module.exports = { getPaymentInfo };
