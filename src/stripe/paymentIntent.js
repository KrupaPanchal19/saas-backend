const getStripeObject = require("./getStraipeObject");

const paymentIntent = async (data, accountID) => {
  try {
    const stripeSecret = await getStripeObject();
    return new Promise((resolve, reject) =>
      stripeSecret.paymentIntents.create(
        data,
        { stripeAccount: accountID },
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

module.exports = { paymentIntent };
