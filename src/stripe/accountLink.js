const getStripeObject = require("./getStraipeObject");

const linkSellerAccount = async (companyStripeAccountID) => {
  try {
    const stripeSecret = await getStripeObject();
    const account = await stripeSecret.accountLinks.create({
      account: companyStripeAccountID,
      refresh_url: "https://tff-v2.thefinal-final.com/login",
      return_url: "https://tff-v2.thefinal-final.com/login",
      type: "account_onboarding",
    });

    return account;
  } catch (e) {
    return e;
  }
};

module.exports = { linkSellerAccount };

// {
//   object: 'account_link',
//   created: 1646130975,
//   expires_at: 1646131275,
//   url: 'https://connect.stripe.com/setup/s/NS9B4Rkpr4T0'
// }
