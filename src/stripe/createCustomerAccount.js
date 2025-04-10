const getStripeObject = require("./getStraipeObject");

const createCustomerAccount = async (customer, accountID) => {
  try {
    const stripeSecret = await getStripeObject();
    return new Promise((resolve, reject) =>
      stripeSecret.customers.create(
        customer,
        { stripeAccount: accountID },
        async function (err, data) {
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

module.exports = { createCustomerAccount };
