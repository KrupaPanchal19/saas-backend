var nodemailer = require("nodemailer");
const handlebars = require("handlebars");
const fs = require("fs");
const path = require("path");
let AWS = require("aws-sdk");
AWS.config.update({
  region: "us-east-2",
  secretAccessKey: `${process.env.AWS_SECRET_ACCESS_KEY}`,
  accessKeyId: `${process.env.AWS_ACCESS_KEY_ID}`,
});

const filePath = path.join(__dirname, "../email_template/template.html");
const source = fs.readFileSync(filePath, "utf-8").toString();
const template = handlebars.compile(source);

const sendMail = (to, subject, replacement) => {
  var transporter = nodemailer.createTransport({
    SES: new AWS.SES({
      apiVersion: "2010-12-01",
      region: "us-east-2",
    }),
  });

  const htmlToSend = template(replacement);

  var mailOptions = {
    from: process.env.EMAIL,
    to: to,
    cc:
      subject === "Payment Mail" && process.env.NODE_ENV !== "development"
        ? "matt@540designstudio.com"
        : null,
    subject: subject,
    html: htmlToSend,
  };

  let response;
  return transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
      response = false;
      return response;
    } else {
      console.log("Email sent: " + info.response);
      response = true;
      return response;
    }
  });
};

module.exports = { sendMail };
