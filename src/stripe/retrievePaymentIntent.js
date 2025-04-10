const getStripeObject = require("./getStraipeObject");

const retrievePaymentIntent = async (id, accountID) => {
  try {
    const stripeSecret = await getStripeObject();
    const paymentIntent = await stripeSecret.paymentIntents.retrieve(id, {
      stripeAccount: accountID,
    });
    return paymentIntent;
  } catch (e) {
    return e;
  }
};

module.exports = { retrievePaymentIntent };
