const getStripeObject = require("./getStraipeObject");

const paymentMethodList = async (id, accountID) => {
  try {
    const stripeSecret = await getStripeObject();
    const paymentMethods = await stripeSecret.paymentMethods.list(
      {
        customer: id,
        type: "card",
      },
      { stripeAccount: accountID }
    );
    return paymentMethods;
  } catch (e) {
    return e;
  }
};

module.exports = { paymentMethodList };
