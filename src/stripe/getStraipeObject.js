require("dotenv").config();
const { findAllPrice } = require("../repository/price.repository");

const getStripeObject = async () => {
  try {
    // const priceData = await findAllPrice({ where: { key: ["privateKey"] } });
    // if (priceData) {
    //   const jsonPriceData = JSON.parse(JSON.stringify(priceData));
    //   let jsonStringData = {};
    //   jsonPriceData.forEach((e) => {
    //     jsonStringData[`${e.key}`] = e.value;
    //   });
    //   if (jsonStringData.privateKey) {
    const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);
    return stripe;
    //   }
    // }
  } catch (e) {
    return e;
  }
};

module.exports = getStripeObject;
