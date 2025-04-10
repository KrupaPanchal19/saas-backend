const { sendMail } = require("./mail.helper");

const { textForMail } = require("../email_template/text_select");

const sendMailHelper = async (
  username,
  to = "webdeveloper1011@gmail.com",
  subject,
  extra_text = null,
  company
) => {
  try {
    let thank_you = `If you have any questions, please contact us at ${process.env.EMAIL}. Thank you for booking your delivery with ${company?.name}!`;

    if (
      subject === "Your Password has been Updated" ||
      subject === "Change Password Request"
    ) {
      thank_you = `If this was not you, or if you have any questions, please contact us at ${process.env.EMAIL}. `;
    }

    if (subject === "Your Password has been Updated") {
      thank_you = `If you have any questions, please contact us at ${process.env.EMAIL}. Thank you for requesting your delivery with ${company?.name}!`;
    }

    if (subject === "Your Delivery Request has been Declined") {
      thank_you = "Thank you for your understanding!";
    }

    const replacement = {
      // logo: company?.logo,
      logo: "https://tff-v2-api.thefinal-final.com/theme/dark-logo.png",
      email: process.env.EMAIL,
      userName: username,
      text: textForMail[subject],
      company_name: company?.name,
      extra_text: extra_text,
      thank_you: thank_you,
    };
    return sendMail(to, subject, replacement);
  } catch (e) {
    return e;
  }
};
module.exports = sendMailHelper;
