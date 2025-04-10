const generalResponse = require("../../helper/general_response.helper");

const { findCompanyUser } = require("../../repository/company_user.repository");

const db = require("../../models");

const companyCustomerDriverAuth = async (req, res, next) => {
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
        where: {
          name: ["driver", "customer"],
        },
        required: true,
      },
      {
        model: db.company,
        where: { stripe_account_status: "Complete" },
        attributes: [
          "id",
          "name",
          "logo",
          "short_name",
          "stripe_account_id",
          "stripe_account_status",
        ],
        required: true,
      },
    ];
    let companyUserInfo = await findCompanyUser({
      where,
      attributes: ["id", "status"],
      include,
    });
    companyUserInfo = JSON.parse(JSON.stringify(companyUserInfo));
    if (companyUserInfo === null) {
      return generalResponse(
        res,
        null,
        "You are not allowed to work as an driver for this company.",
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
    console.log(e, "ddsg");
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

module.exports = companyCustomerDriverAuth;
