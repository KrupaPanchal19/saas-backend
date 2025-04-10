require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const passport = require("passport");

const port = process.env.PORT;

// initialize a passport strategy
require("./src/middleware/passport/passport_auth");

// route files
const company = require("./src/route/company/company.route");
const user = require("./src/route/user/user.route");
const role = require("./src/route/role/role.route");
const authentication = require("./src/route/authentication/authentication.route");
//payment
const payment = require("./src/route/payment/stripe.route");

// admin route
const customer_admin = require("./src/route/admin/customer_admin.route");
const driver_admin = require("./src/route/admin/driver_admin.route");
const staff_admin = require("./src/route/admin/staff_admin.route");
const item_admin = require("./src/route/admin/item_admin.route");
const holidays_admin = require("./src/route/admin/holidays_admin.route");
const day_block_time_admin = require("./src/route/admin/day_block_time_admin.route");
const service_locator_admin = require("./src/route/admin/service_locator_admin.route");
const price_admin = require("./src/route/admin/price_admin.route");
const notification_admin = require("./src/route/admin/notification_admin.route");
const contact_us_admin = require("./src/route/admin/contact_us_admin.route");
const covid_19_cms_admin = require("./src/route/admin/covid_19_cms_admin.route");
const delivery_admin = require("./src/route/admin/delivery_admin.route");
const dashboard_admin = require("./src/route/admin/dashboard_admin.route");
const chat_admin = require("./src/route/admin/chat_admin.route");
const setting_admin = require("./src/route/admin/setting_admin.route");

//customer route
const service_locator_customer = require("./src/route/customer/service_locator_customer.route");
const item_customer = require("./src/route/customer/item_customer.route");
const delivery_customer = require("./src/route/customer/delivery_customer.route");
const profile_customer = require("./src/route/customer/profile_customer.route");
const price_customer = require("./src/route/customer/price_customer.route");
const payment_customer = require("./src/route/customer/payment_customer.route");

//customer-driver route
const contact_us_customer_driver = require("./src/route/customer_driver/contact_us_customer_driver.route");
const covid_19_cms_customer_driver = require("./src/route/customer_driver/covid_19_cms_customer_driver.route");
const holidays_customer_driver = require("./src/route/customer_driver/holidays_customer_driver.route");
const notification_token_customer_driver = require("./src/route/customer_driver/notification_token_customer_driver.route");
const day_block_time_customer_driver = require("./src/route/customer_driver/day_block_time_customer_driver.route");
const profile_customer_driver = require("./src/route/customer_driver/profile_customer_driver.route");
const chat_customer_driver = require("./src/route/customer_driver/chat_customer_driver.route");
const delivery_customer_driver = require("./src/route/customer_driver/delivery_customer_driver.route");

//driver route
const delivery_driver = require("./src/route/driver/delivery_driver.route");
const profile_driver = require("./src/route/driver/profile_driver.route");

//forgot password
const forget_password = require("./src/route/forget_password/forget_password.route");

app.use(cors());
app.use(passport.initialize());
app.use(express.static(path.join(__dirname, "./public")));
app.use(fileUpload());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// for firebase app
// const firebaseAdmin = require("firebase-admin");
// const theFinalFinalServiceAccount = require(`./src/config/the_final_final.json`);
// firebaseAdmin.initializeApp(
//   {
//     credential: firebaseAdmin.credential.cert(theFinalFinalServiceAccount),
//   },
//   "the_final_final"
// );

//for stripe webhook

const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);

const endpointSecret =
  "whsec_64f9b54a5d6090ce39601635badc6bd27f8fd7e63455202a0a9b6910d95800ff";

app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (request, response) => {
    const sig = request.headers["stripe-signature"];

    let event;
    try {
      event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
    } catch (err) {
      response.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }
    // Handle the event
    switch (event.type) {
      case "account.updated":
        const account = event.data.object;
        const accountId = account.id;
        if (account.charges_enabled) {
          await updateCompany(
            { stripe_account_status: "Complete" },
            { stripe_account_id: accountId }
          );
        }
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    response.send();
  }
);

//route
app.use(company);
app.use(user);
app.use(role);
app.use(authentication);
app.use(payment);

//admin
app.use(customer_admin);
app.use(driver_admin);
app.use(staff_admin);
app.use(item_admin);
app.use(holidays_admin);
app.use(day_block_time_admin);
app.use(service_locator_admin);
app.use(price_admin);
app.use(notification_admin);
app.use(contact_us_admin);
app.use(covid_19_cms_admin);
app.use(delivery_admin);
app.use(dashboard_admin);
app.use(chat_admin);
app.use(setting_admin);

//customer
app.use(service_locator_customer);
app.use(item_customer);
app.use(delivery_customer);
app.use(profile_customer);
app.use(price_customer);
app.use(payment_customer);

//customer-driver
app.use(contact_us_customer_driver);
app.use(covid_19_cms_customer_driver);
app.use(holidays_customer_driver);
app.use(notification_token_customer_driver);
app.use(day_block_time_customer_driver);
app.use(profile_customer_driver);
app.use(chat_customer_driver);
app.use(delivery_customer_driver);

//driver
app.use(delivery_driver);
app.use(profile_driver);

//forgot password
app.use(forget_password);

const http = require("http");
const socketIO = require("socket.io");
const { updateCompany } = require("./src/repository/company.repository");
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "*",
  },
  transports: ["websocket"],
});
module.exports = io;

require("./src/socketIO/index");

server.listen(port, () => {
  console.log("server is on port " + port);
});
