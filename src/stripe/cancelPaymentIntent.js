const getStripeObject = require("./getStraipeObject");

const cancelPaymentIntent = async (id) => {
  try {
    const stripeSecret = await getStripeObject();
    // https://stripe.com/docs/refunds#canceling-a-paymentintent
    const paymentIntent = await stripeSecret.paymentIntents.retrieve(id);
    if (
      paymentIntent.status === "requires_payment_method" ||
      paymentIntent.status === "requires_capture" ||
      paymentIntent.status === "requires_confirmation" ||
      paymentIntent.status === "requires_action"
    )
      return new Promise((resolve, reject) =>
        stripeSecret.paymentIntents.cancel(id, async (err, data) => {
          if (err) {
            reject(err);
          }
          if (data && data.id) {
            resolve(data);
          }
        })
      );
    else {
      return { status: paymentIntent.status };
    }
  } catch (e) {
    return e;
  }
};

module.exports = { cancelPaymentIntent };
