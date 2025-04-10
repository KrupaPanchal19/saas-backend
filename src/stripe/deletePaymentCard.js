const getStripeObject = require("./getStraipeObject");

const paymentCardDelete = async (id, accountID) => {
  try {
    const stripeSecret = await getStripeObject();
    return stripeSecret.paymentMethods.detach(id, { stripeAccount: accountID });
  } catch (e) {
    return e;
  }
};

module.exports = { paymentCardDelete };
