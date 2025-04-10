const getStripeObject = require("./getStraipeObject");

const createSellerAccount = async () => {
  try {
    const stripeSecret = await getStripeObject();
    const account = await stripeSecret.accounts.create({
      type: "standard",
      business_type: "company",
    });
    return account;
  } catch (e) {
    return e;
  }
};

module.exports = { createSellerAccount };

// return account id
