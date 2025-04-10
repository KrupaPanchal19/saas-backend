const { findUser, updateUser } = require("../../repository/user.repository");
const generalResponse = require("../../helper/general_response.helper");
const { genRanHex } = require("../../helper/generate-hex-data.helper");
const sendMailHelper = require("../../helper/sendmail.helper");
const {
  insertForgetPasswordToken,
  getUserWithRelation,
} = require("../../repository/forget_password_token.repository");
const moment = require("moment");

const db = require("../../models/");

const forgetPasswordController = async (req, res) => {
  try {
    const { email } = req.body;
    let where = { email };
    let user = await findUser({ where });
    if (user === null) {
      return generalResponse(
        res,
        [],
        "You are not allowed to access this website!!",
        "error"
      );
    } else {
      const token = genRanHex();
      let tokenDataForTable = {
        token: token,
        user_id: user.id,
        expire_date: moment(new Date())
          .add(24, "hours")
          .format("YYYY-MM-DD HH:mm:ss"),
      };
      let domainURL = process.env.WEB_URL;
      let extraHtml = `We have received a request to change your password. Please verify the below account information:

        <div style="width: 100%;float: left;">
        <br/>
        <span><b>Name</b> : ${user.name}</span><br/>
        <span><b>Email</b> : ${user.email}</span><br/>
        <span><b>Phone Number</b> : ${user.phone_number}</span><br/>
        </div>
       <div style="width:100%;padding:0px;margin:0px;">
          <a href=${domainURL}/forget_password/${token}>Change Password</a>
          <br/><br/>
        </div>
        `;

      // If the above link does not work please click here,<br/>
      // ${domainURL}/forget_password/${token}
      // <br/>
      await sendMailHelper(
        user.name,
        user.email,
        "Change Password Request",
        extraHtml
      );
      await insertForgetPasswordToken(tokenDataForTable);
      return generalResponse(
        res,
        `${domainURL}/forget_password/${token}`,
        "Forget Password link generated successfully",
        "success",
        true,
        200
      );
    }
  } catch (e) {
    return generalResponse(res, e, "something wrong", "error");
  }
};

const getForgetPasswordInfo = async (req, res) => {
  try {
    const user_id = req.tokenInfo.user_id;
    let where = {
      id: user_id,
    };
    let attribute = ["phone_number", "email", "name", "address", "image_path"];
    let relation = [
      {
        model: db.forget_password_token,
        as: "forget_password_token",
        required: true,
      },
    ];
    const data = await getUserWithRelation(where, relation, attribute);
    const jsonData = JSON.parse(JSON.stringify(data));
    return generalResponse(
      res,
      {
        user: jsonData,
      },
      "",
      "success",
      true,
      200
    );
  } catch (e) {
    return generalResponse(res, e, "something wrong", "error");
  }
};

const updatePassword = async (req, res) => {
  try {
    const { newPassword: password, user_id: id } = req.body;
    const databaseUpdateRes = await updateUser({ password }, { id: id });
    if (databaseUpdateRes[0]) {
      return generalResponse(res, [], "password change", "success", true);
    } else {
      return generalResponse(res, [], "something wrong", "error");
    }
  } catch (e) {
    return generalResponse(res, e, "something wrong", "error");
  }
};

module.exports = {
  forgetPasswordController,
  getForgetPasswordInfo,
  updatePassword,
};
