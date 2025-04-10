require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const generalResponse = require("../../helper/general_response.helper");
const db = require("../../models");
const { findCompanyUser } = require("../../repository/company_user.repository");

const { findUser } = require("../../repository/user.repository");

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = await findUser({
      where: { email },
    });
    if (user === null) {
      return generalResponse(
        res,
        null,
        "You are not allowed to access this platform!!",
        "error"
      );
    }
    const isPasswordMatching = await bcrypt.compare(password, user.password);
    if (isPasswordMatching) {
      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          userRole: user.role,
        },
        process.env.SECRET_KEY,
        { expiresIn: "30d" }
      );
      return generalResponse(res, token);
    } else {
      return generalResponse(res, null, "password incorrect", "error", true);
    }
  } catch (e) {
    return generalResponse(
      res,
      e,
      "Something went wrong!!",
      "error",
      false,
      200
    );
  }
};

const emailCheck = async (req, res) => {
  try {
    const { email } = req.body;
    let userData = await findUser({
      where: { email },
    });
    let user = JSON.parse(JSON.stringify(userData));

    if (user) {
      let company_user = await findCompanyUser({
        where: { user_id: user.id },
        include: {
          model: db.role,
          required: true,
        },
      });
      company_user = JSON.parse(JSON.stringify(company_user));
      if (company_user && company_user?.role) {
        if (company_user?.role.name !== "customer") {
          return generalResponse(
            res,
            null,
            "User is already registered as a driver or admin, please change email",
            "error",
            true,
            200
          );
        }
      }
    }

    const phoneCountryCodeArray = ["+1", "+91"];
    if (user && user.hasOwnProperty("phone_number")) {
      let prefix;
      phoneCountryCodeArray.forEach((e) => {
        if (user.phone_number.startsWith(e)) {
          prefix = e;
        }
      });
      user.phone_country_code = prefix;
      user.phone_number = user.phone_number.slice(prefix.length);
    }
    return generalResponse(res, user);
  } catch (e) {
    return generalResponse(
      res,
      e,
      "Something went wrong!!",
      "error",
      false,
      200
    );
  }
};

module.exports = { login, emailCheck };
