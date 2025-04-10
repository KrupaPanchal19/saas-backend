const getStripeObject = require("./getStraipeObject");

const refundPayment = async (id) => {
  try {
    const stripeSecret = await getStripeObject();
    // https://stripe.com/docs/refunds
    return new Promise((resolve, reject) =>
      stripeSecret.refunds.create(
        {
          payment_intent: id,
        },
        async (err, data) => {
          if (err) {
            reject(err);
          }
          if (data && data.id) {
            resolve(data);
          }
        }
      )
    );
  } catch (e) {
    return e;
  }
};

module.exports = { refundPayment };
