const verifyAccount = async (publicKey, privateKey) => {
  try {
    const stripeSecret = require("stripe")(privateKey);
    return new Promise((resolve, reject) =>
      stripeSecret.accounts.retrieve(async (err, data) => {
        if (err) {
          console.log(err);
          reject(err);
        }
        if (data && data.id) {
          console.log(data);
          resolve(true);
        }
      })
    );
  } catch (e) {
    return e;
  }
};

module.exports = { verifyAccount };
