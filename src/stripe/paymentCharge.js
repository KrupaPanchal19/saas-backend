const getStripeObject = require("./getStraipeObject");

const paymentCharges = async (id, accountID) => {
  try {
    const stripeSecret = await getStripeObject();
    return new Promise((resolve, reject) =>
      stripeSecret.paymentIntents.capture(
        id,
        {
          stripeAccount: accountID,
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

module.exports = { paymentCharges };
