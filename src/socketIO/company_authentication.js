const db = require("../models/");
const { findCompanyUser } = require("../repository/company_user.repository");

const companyAuthentication = async (socket, next) => {
  try {
    const companyUser = await findCompanyUser({
      where: {
        company_id: socket.decoded["company_id"],
        user_id: socket.decoded.userId,
        status: "ACTIVE",
      },
      include: [
        {
          model: db.role,
          attributes: ["name"],
          required: true,
        },
        {
          model: db.user,
          attributes: ["name", "email", "image_path"],
          required: true,
        },
        {
          model: db.company,
          attributes: ["name"],
          required: true,
        },
      ],
    });
    const companyUserJson = JSON.parse(JSON.stringify(companyUser));
    if (companyUserJson) {
      socket.decoded["company_user_info"] = companyUserJson;
      next();
    } else {
      next(new Error("you are not allowed to use"));
    }
  } catch (e) {
    next(new Error("Company Authentication error"));
  }
};

module.exports = companyAuthentication;
