require("dotenv").config();
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

const db = require("../../models/");

const generalResponse = require("../../helper/general_response.helper");
const imageFilter = require("../../helper/image_filter.helper");
const folderExistCheck = require("../../helper/folder_exist_check.helper");

const {
  findAllUser,
  findUser,
  createUser: createUserRepo,
  updateUser: updateUserRepo,
  deleteUser: deleteUserRepo,
} = require("../../repository/user.repository");
const {
  findAllCompanyUser,
  findCompanyUser,
} = require("../../repository/company_user.repository");
const sendMailHelper = require("../../helper/sendmail.helper");
const { linkSellerAccount } = require("../../stripe/accountLink");

const getAllUsers = async (req, res) => {
  try {
    const roleData = await findAllUser();
    return generalResponse(res, roleData);
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

const getUser = async (req, res) => {
  try {
    const userID = req.params.id;
    const userData = await findUser({ where: { id: userID } });
    if (userData) {
      return generalResponse(res, userData);
    } else {
      return generalResponse(res, null, "user not found", "error", true, 200);
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

const createUser = async (req, res) => {
  try {
    const user = await createUserRepo(req.body);
    return generalResponse(res, user, "User created successfully");
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
const registerUser = async (req, res) => {
  try {
    let condition = false;
    const roleData = await findAllUser();
    JSON.parse(JSON.stringify(roleData)).forEach((data) => {
      console.log(data.email, req.body.email);
      if (data.email === req.body.email) {
        condition = true;
      }
    });
    if (condition) {
      return generalResponse(
        res,
        {},
        "Email Already Register !",
        "error",
        true,
        200
      );
    } else {
      const user = await createUserRepo(req.body);
      return generalResponse(res, user, "User Register successfully");
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

const updateUser = async (req, res) => {
  const update = Object.keys(req.body);
  const allowUpdate = [
    "id",
    "name",
    "email",
    "phone_number",
    "image_path",
    "zip_code",
    "driver_need_helper",
    "driver_cdl_license",
    "password",
    "address",
  ];
  const invalidedOP = update.every((update) => allowUpdate.includes(update));
  if (!invalidedOP) {
    return generalResponse(res, [], "invalided operation", "error");
  }
  if (req.body.email) {
    const user = await findUser({
      where: {
        email: req.body.email,
        id: { [Op.not]: req.body.id },
      },
    });
    if (user) {
      return generalResponse(
        res,
        null,
        "Please enter another email because this email is already exist!!",
        "error",
        true,
        200
      );
    }
  }
  if (req.body.phone_number) {
    const user = await findUser({
      where: {
        phone_number: req.body.phone_number,
        id: { [Op.not]: req.body.id },
      },
    });

    if (user) {
      return generalResponse(
        res,
        null,
        "Please enter another phone number because this phone number is already in use!",
        "error",
        true,
        200
      );
    }
  }
  try {
    const { id, ...rest } = req.body;
    const notNullFiled = ["name", "email", "phone_number", "password"];
    Object.keys(rest).forEach((e) =>
      rest[`${e}`] === ""
        ? notNullFiled.includes(e)
          ? delete rest[`${e}`]
          : (rest[`${e}`] = null)
        : null
    );
    if (rest.password) {
      await sendMailHelper(
        rest.name,
        rest.email,
        "Your Password has been Updated",
        null,
        req.company
      );
    }

    if (req.files && req.files.image_path) {
      let file = req.files.image_path;
      let fileName = file.name.replace(/\s/g, "_");
      const fileExtRes = imageFilter(fileName);
      if (!fileExtRes) {
        return generalResponse(
          res,
          [],
          "Only image files are allowed like jpg,jpeg or png!",
          "error",
          true,
          200
        );
      }
      const current_date = new Date();
      let seconds = Math.round(current_date.getTime() / 1000);
      let filename = seconds + "_" + fileName;
      const folderCheck = folderExistCheck(`./public/userProfile/`);
      if (folderCheck) {
        file.mv(`./public/userProfile/${filename}`, async (err) => {
          if (err) {
            throw new Error("file not move in folder");
          } else {
            rest.image_path = `/userProfile/${filename}`;
            await updateUserRepo(rest, { id });
            return generalResponse(res, null, "user updated successfully");
          }
        });
      }
    } else {
      await updateUserRepo(rest, { id });
      return generalResponse(res, null, "user updated successfully");
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

const deleteUser = async (req, res) => {
  try {
    const userID = req.params.id;
    await deleteUserRepo({ id: userID });
    return generalResponse(
      res,
      null,
      "user deleted successfully",
      "success",
      true
    );
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

const getUserCompany = async (req, res) => {
  try {
    const userID = req.user.id;
    const where = { user_id: userID, status: "ACTIVE" };
    const include = [
      {
        model: db.company,
        required: true,
      },
    ];
    const companyData = await findAllCompanyUser({
      where,
      include,
      group: ["company_id"],
    });
    return generalResponse(res, companyData);
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

const getCurrentUser = async (req, res) => {
  try {
    return generalResponse(res, req.user);
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
const getCompanyStripeLink = async (req, res) => {
  try {
    const userID = req.user.id;
    const companyID = req.body.id;
    const companyStripeAccountID = req.body.stripe_account_id;
    const where = {
      user_id: userID,
      status: "ACTIVE",
      company_id: companyID,
    };
    const include = [
      {
        model: db.role,
        where: { name: "admin" },
        required: true,
      },
    ];
    const companyData = await findCompanyUser({
      where,
      include,
    });
    if (companyData === null) {
      return generalResponse(
        res,
        null,
        "You don't work for the current company as an admin",
        "error",
        true,
        200
      );
    }

    const accountStripeLinkResponse = await linkSellerAccount(
      companyStripeAccountID
    );
    return generalResponse(res, accountStripeLinkResponse);
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

module.exports = {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getUserCompany,
  getCurrentUser,
  getCompanyStripeLink,
  registerUser,
};
