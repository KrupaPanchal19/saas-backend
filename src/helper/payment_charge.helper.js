const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const db = require("../models/");
const { findDelivery } = require("../repository/delivery.repository");
const {
  updateDeliveryPaymentLog,
} = require("../repository/delivery_payment_log.repository");

const { paymentCharges } = require("../stripe/paymentCharge");
const { retrievePaymentIntent } = require("../stripe/retrievePaymentIntent");

const paymentChargeHelper = async (delivery_id, stripe_account_id) => {
  try {
    const where = {
      id: delivery_id,
      payment_type: "online",
    };
    const relation = [
      {
        model: db.delivery_payment_log,
        as: "delivery_payment_log",
        required: false,
        attributes: [
          "payment_status",
          "transaction_id",
          "delivery_id",
          "type",
          "id",
        ],
        where: {
          payment_status: { [Op.in]: ["pending", "success"] },
          delivery_id: delivery_id,
        },
      },
    ];
    const deliveryData = await findDelivery({
      where,
      attributes: ["total_price"],
      include: relation,
    });
    if (
      deliveryData.delivery_payment_log.length > 0 &&
      deliveryData.delivery_payment_log[0].payment_status === "success"
    ) {
      return true;
    } else if (
      deliveryData.delivery_payment_log.length > 0 &&
      deliveryData.delivery_payment_log[0].payment_status === "pending"
    ) {
      const paymentIntentData = await retrievePaymentIntent(
        deliveryData.delivery_payment_log[0].transaction_id,
        stripe_account_id
      );
      if (
        paymentIntentData &&
        paymentIntentData.status === "requires_capture"
      ) {
        const ResDataForCharges = await paymentCharges(
          deliveryData.delivery_payment_log[0].transaction_id,
          stripe_account_id
        );

        if (ResDataForCharges.status == "succeeded") {
          await updateDeliveryPaymentLog(
            {
              payment_status: "success",
              amount: parseFloat(deliveryData.total_price).toFixed(2),
            },
            {
              transaction_id:
                deliveryData.delivery_payment_log[0].transaction_id,
            }
          );
          return { mail: "success" };
        } else {
          await updateDeliveryPaymentLog(
            {
              payment_status: "failed",
              amount: parseFloat(deliveryData.total_price).toFixed(2),
            },
            {
              transaction_id:
                deliveryData.delivery_payment_log[0].transaction_id,
            }
          );
          return { mail: "failed" };
        }
      } else {
        await updateDeliveryPaymentLog(
          {
            payment_status: "failed",
            amount: parseFloat(deliveryData.total_price).toFixed(2),
          },
          {
            transaction_id: deliveryData.delivery_payment_log[0].transaction_id,
          }
        );
        return { mail: "failed" };
      }
    } else {
      return false;
    }
  } catch (e) {
    return e;
  }
};

module.exports = { paymentChargeHelper };
