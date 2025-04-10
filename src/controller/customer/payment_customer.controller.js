const db = require("../../models/");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

const generalResponse = require("../../helper/general_response.helper");
const { paymentChargeHelper } = require("../../helper/payment_charge.helper");
const { DeliveryInfoMail } = require("../../helper/delivery_info_mail.helper");
const sendMailHelper = require("../../helper/sendmail.helper");

const {
  findAllDelivery,
  findDelivery,
} = require("../../repository/delivery.repository");
const {
  createDeliveryPaymentLogs,
} = require("../../repository/delivery_payment_log.repository");

const { paymentMethodList } = require("../../stripe/paymentMethodList");
const { retrievePaymentIntent } = require("../../stripe/retrievePaymentIntent");
const { paymentCardDelete } = require("../../stripe/deletePaymentCard");
const { paymentIntent } = require("../../stripe/paymentIntent");

const stripePaymentMethodLists = async (req, res) => {
  try {
    const paymentMethods = await paymentMethodList(
      req.payment_customer_id,
      req.company.stripe_account_id
    );
    if (paymentMethods) {
      return generalResponse(res, paymentMethods, "", "success", false, 200);
    } else {
      return generalResponse(res, [], "No data found", "error", false, 200);
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

const stripeDeleteCard = async (req, res) => {
  try {
    const { id } = req.user;
    let whereCondition = {
      user_id: id,
      payment_type: "online",
      company_id: req.company_id,
    };
    const reletion = [
      {
        model: db.delivery_payment_log,
        as: "delivery_payment_log",
        where: {
          payment_status: "pending",
        },
        paranoid: false,
        attributes: ["payment_status", "transaction_id"],
        required: true,
      },
    ];
    const data = await findAllDelivery({
      where: whereCondition,
      attributes: [],
      include: reletion,
    });

    if (data.length > 0) {
      const intentIds = await data.map((e) => {
        return e.delivery_payment_log[0].transaction_id;
      });
      let requires_capture_status = false;
      await Promise.all(
        intentIds.map(async (e) => {
          const paymentResponse = await retrievePaymentIntent(
            e,
            req.company.stripe_account_id
          );
          if (paymentResponse.status === "requires_capture") {
            requires_capture_status = true;
          }
        })
      );
      if (requires_capture_status) {
        return generalResponse(
          res,
          [],
          "your card is used in some delivery.",
          "error",
          false,
          200
        );
      }
    }
    const paymentMethod = req?.body?.paymentMethod;
    if (paymentMethod === "") {
      return generalResponse(
        res,
        [],
        "payment method is empty",
        "error",
        true,
        200
      );
    }
    const deleteCardData = await paymentCardDelete(
      paymentMethod,
      req.company.stripe_account_id
    );
    if (!deleteCardData.customer) {
      return generalResponse(
        res,
        [],
        "your card deleted successfully",
        "success",
        true,
        200
      );
    } else {
      throw new Error();
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

const deliveryChargeDeduct = async (req, res) => {
  try {
    const delivery_id = req.body.delivery_id;
    let msg = "";
    const resDataOfPayment = await paymentChargeHelper(
      delivery_id,
      req.company.stripe_account_id
    );
    if (resDataOfPayment === true) {
      msg = "Delivery payment is already done";
    } else if (resDataOfPayment.mail) {
      if (resDataOfPayment.mail === "success") {
        const extraText = await DeliveryInfoMail(delivery_id);
        await sendMailHelper(
          req.user.name,
          req.user.email,
          "Payment Confirmation",
          extraText
        );
        msg = "Delivery payment is successfully completed";
      } else if (resDataOfPayment.mail === "failed") {
        await sendMailHelper(
          req.user.name,
          req.user.email,
          "Payment failed",
          null
        );
        msg = "Delivery payment is failed";
      }
    } else if (resDataOfPayment === false) {
      msg = "Delivery payment is padding";
    }
    return generalResponse(res, [], msg, "success", true, 200);
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

const deliveryCharge = async (req, res) => {
  try {
    const { email } = req.user;
    const payment_customer_id = req.payment_customer_id;
    let { total_price, delivery_id } = req.body;
    total_price = parseInt(total_price);
    const where = {
      id: delivery_id,
      company_id: req.company_id,
    };
    const relation = [
      {
        model: db.delivery_payment_log,
        as: "delivery_payment_log",
        required: false,
        attributes: ["payment_status", "transaction_id", "delivery_id", "type"],
        where: {
          payment_status: { [Op.in]: ["pending", "success"] },
          delivery_id: delivery_id,
        },
      },
    ];
    const deliveryData = await findDelivery({
      where,
      include: relation,
      attributes: ["total_price"],
    });
    // const prizeResponseData = await getPriceByKey(["publicKey", "privateKey"]);
    // let priceData = {};
    // // const JsonData = JSON.parse(JSON.stringify(prizeResponseData));
    // prizeResponseData.forEach((e) => {
    //   priceData[`${e.key}`] = e.value;
    // });
    if (
      deliveryData &&
      deliveryData.total_price &&
      deliveryData.delivery_payment_log.length === 0
    ) {
      if (
        total_price ===
        Math.round(parseFloat(deliveryData.total_price.toFixed(2)) * 100)
      ) {
        const paymentIntentRes = await paymentIntent(
          {
            amount: Math.round(
              parseFloat(deliveryData.total_price.toFixed(2)) * 100
            ),
            currency: "usd",
            payment_method_types: ["card"],
            customer: payment_customer_id,
            receipt_email: email,
            capture_method: "manual",
          },
          req.company.stripe_account_id
        );
        if (
          paymentIntentRes &&
          paymentIntentRes.object &&
          paymentIntentRes.id
        ) {
          const paymentData = paymentIntentRes.id;
          const clientSecret = paymentIntentRes.client_secret;
          const deliveryData = {
            payment_type: "online",
            payment_status: "pending",
            transaction_id: paymentData,
            delivery_id: delivery_id,
            type: "payment",
          };
          await createDeliveryPaymentLogs(deliveryData);
          return generalResponse(
            res,
            {
              publicKey: process.env.STRIPE_PUBLIC_KEY,
              privateKey: process.env.STRIPE_PRIVATE_KEY,
              client_secret: clientSecret,
              customer_stripe_id: payment_customer_id,
              stripe_account_id: req.company.stripe_account_id,
            },
            "",
            "success",
            false,
            200
          );
        } else {
          throw new Error(
            "Something went wrong in create payment intent in stripe"
          );
        }
      } else {
        return generalResponse(
          res,
          [],
          "Payment price is not correct",
          "error",
          true,
          200
        );
      }
    } else if (
      deliveryData &&
      deliveryData.total_price &&
      deliveryData.delivery_payment_log.length > 0 &&
      deliveryData.delivery_payment_log[0].payment_status === "pending"
    ) {
      const details = await retrievePaymentIntent(
        deliveryData.delivery_payment_log[0].transaction_id,
        req.company.stripe_account_id
      );
      if (details) {
        return generalResponse(
          res,
          {
            publicKey: process.env.STRIPE_PUBLIC_KEY,
            privateKey: process.env.STRIPE_PRIVATE_KEY,
            client_secret: details.client_secret,
            customer_stripe_id: payment_customer_id,
            stripe_account_id: req.company.stripe_account_id,
          },
          "",
          "success",
          false,
          200
        );
      } else {
        throw new Error(
          "Something went wrong in retrieve payment intent in stripe"
        );
      }
    } else if (
      deliveryData &&
      deliveryData.total_price &&
      deliveryData.delivery_payment_log.length > 0 &&
      deliveryData.delivery_payment_log[0].payment_status === "success"
    ) {
      return generalResponse(
        res,
        [],
        "Delivery payment is successfully done",
        "error",
        false,
        200
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

module.exports = {
  stripePaymentMethodLists,
  stripeDeleteCard,
  deliveryChargeDeduct,
  deliveryCharge,
};
