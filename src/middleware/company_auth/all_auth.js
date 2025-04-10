const generalResponse = require("../../helper/general_response.helper");

const { findCompanyUser } = require("../../repository/company_user.repository");

const db = require("../../models/");

const companyAllAuth = async (req, res, next) => {
  try {
    const user_id = req.user.id;
    const company_id = req.headers["x-tff-company-id"];
    if (company_id === undefined) {
      return generalResponse(
        res,
        null,
        "Company id is undefined",
        "error",
        true,
        200
      );
    }
    let where = { company_id, user_id };
    let include = [
      {
        model: db.role,
        required: true,
      },
      {
        model: db.company,
        attributes: ["id", "name", "logo", "short_name"],
        required: true,
      },
    ];
    let companyUserInfo = await findCompanyUser({ where, include });
    companyUserInfo = JSON.parse(JSON.stringify(companyUserInfo));
    if (companyUserInfo === null) {
      return generalResponse(
        res,
        null,
        "You are not allowed.",
        "error",
        true,
        200
      );
    }
    if (companyUserInfo.status !== "ACTIVE") {
      return generalResponse(
        res,
        null,
        "You are not Active!!",
        "error",
        true,
        200
      );
    }
    req.company_id = req.headers["x-tff-company-id"];
    req.company = companyUserInfo.company;
    next();
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

module.exports = companyAllAuth;
