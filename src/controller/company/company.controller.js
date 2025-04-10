require("dotenv").config();

const generalResponse = require("../../helper/general_response.helper");
const imageFilter = require("../../helper/image_filter.helper");
const folderExistCheck = require("../../helper/folder_exist_check.helper");

const {
  findAllCompanies,
  findCompany,
  createCompany: createCompanyRepo,
  updateCompany: updateCompanyRepo,
  deleteCompany: deleteCompanyRepo,
} = require("../../repository/company.repository");
const { bulkCreateRole } = require("../../repository/role.repository");
const { findUser, createUser } = require("../../repository/user.repository");
const {
  createCompanyUser,
} = require("../../repository/company_user.repository");
const {
  createServiceAresRestrictionMode,
} = require("../../repository/service_area_restriction.repository");

const randomFiveNumber = require("../../helper/random_five_number.helper");
const { sequelize } = require("../../models");
const {
  createCovid19CMS,
} = require("../../repository/covid_19_cms.repository");

const { createSellerAccount } = require("../../stripe/addStripeAccount");
const sendMailHelper = require("../../helper/sendmail.helper");

const getAllCompanies = async (req, res) => {
  try {
    const companyData = await findAllCompanies();
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

const getCompany = async (req, res) => {
  try {
    const companyID = req.params.id;
    const companyData = await findCompany({ where: { id: companyID } });
    if (companyData) {
      return generalResponse(res, companyData);
    } else {
      return generalResponse(
        res,
        null,
        "Company not found",
        "error",
        true,
        200
      );
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

const createCompany = async (req, res) => {
  try {
    const company = await createCompanyRepo(req.body);
    return generalResponse(res, company, "Company created successfully");
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

const updateCompany = async (req, res) => {
  const update = Object.keys(req.body);
  const allowUpdate = ["id", "name", "short_name", "logo"];
  const invalidedOP = update.every((update) => allowUpdate.includes(update));
  if (!invalidedOP) {
    return generalResponse(res, [], "invalided operation", "error");
  }
  try {
    const { id, ...rest } = req.body;
    const notNullFiled = ["name"];
    Object.keys(rest).forEach((e) =>
      rest[`${e}`] === ""
        ? notNullFiled.includes(e)
          ? delete rest[`${e}`]
          : (rest[`${e}`] = null)
        : null
    );
    if (req.files && req.files.logo) {
      let file = req.files.logo;
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
      const folderCheck = folderExistCheck(`./public/companyProfile/`);
      if (folderCheck) {
        file.mv(`./public/companyProfile/${filename}`, async (err) => {
          if (err) {
            throw new Error("file not move in folder");
          } else {
            rest.logo = `/companyProfile/${filename}`;
            await updateCompanyRepo(rest, { id });
            return generalResponse(res, null, "Company updated successfully");
          }
        });
      }
    } else {
      await updateCompanyRepo(rest, { id });
      return generalResponse(res, null, "Company updated successfully");
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

const deleteCompany = async (req, res) => {
  try {
    const companyID = req.params.id;
    await deleteCompanyRepo({ id: companyID });
    return generalResponse(
      res,
      null,
      "Company deleted successfully",
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

const registerCompany = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const {
      role,
      name,
      short_name,
      admin_email,
      admin_password,
      admin_name,
      admin_phone_number,
      admin_zip_code,
      admin_address,
    } = req.body;
    let logo = null;
    let image_path = null;
    const companyNameChecking = await findCompany({
      where: { name: name.trim() },
    });
    if (companyNameChecking) {
      return generalResponse(
        res,
        null,
        "Company name is already exits",
        "error",
        true,
        200
      );
    }
    if (req.files) {
      const current_date = new Date();
      let seconds = Math.round(current_date.getTime() / 1000);
      if (req.files.logo) {
        let file = req.files.logo;
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
        let filename = seconds + "_" + fileName;
        const folderCheck = folderExistCheck(`./public/companyProfile/`);
        if (folderCheck) {
          logo = `/companyProfile/${filename}`;
          file.mv(`./public/companyProfile/${filename}`, async (err) => {
            if (err) {
              throw new Error("file not move in folder");
            }
          });
        }
      }
      if (req.files.admin_image_path) {
        let file1 = req.files.admin_image_path;
        let fileName1 = file1.name.replace(/\s/g, "_");
        const fileExtRes1 = imageFilter(fileName1);
        if (!fileExtRes1) {
          return generalResponse(
            res,
            [],
            "Only image files are allowed like jpg,jpeg or png!",
            "error",
            true,
            200
          );
        }
        let filename1 = seconds + "_" + fileName1;
        const folderCheck1 = folderExistCheck(`./public/userProfile/`);
        if (folderCheck1) {
          image_path = `/userProfile/${filename1}`;
          file1.mv(`./public/userProfile/${filename1}`, async (err) => {
            if (err) {
              throw new Error("file not move in folder");
            }
          });
        }
      }
    }

    const stripeAccount = await createSellerAccount();

    if (stripeAccount.id === undefined) {
      return generalResponse(
        res,
        null,
        "we can't create your in Stripe,please try again",
        "error",
        true,
        200
      );
    }

    const company = await createCompanyRepo(
      {
        name: name.trim(),
        short_name: short_name.trim(),
        logo,
        stripe_account_id: stripeAccount.id,
      },
      t
    );

    const covidPageData = {
      company_id: company.id,
      name: "covid 19",
      html: "<p>Due to the COVID-19 outbreak, many organizations and groups are publishing important coronavirus-related announcements that affect our everyday lives.</p>",
    };
    await createCovid19CMS(covidPageData, t);

    await createServiceAresRestrictionMode(
      {
        company_id: company.id,
        mode: false,
      },
      t
    );

    const roleJson = role.map((e) => ({ company_id: company.id, name: e }));
    const roles = await bulkCreateRole(roleJson, t);
    const userChecking = await findUser({
      where: { email: admin_email },
      transaction: t,
    });
    const adminRole = roles.find((e) => e.name === "admin");
    const id_number = randomFiveNumber("a");
    if (userChecking) {
      await createCompanyUser(
        {
          company_id: company.id,
          role_id: adminRole.id,
          user_id: userChecking.id,
          id_number,
          status: "ACTIVE",
        },
        t
      );
      let extraTextData = ``;
      await sendMailHelper(
        admin_name,
        admin_email,
        "Company Registration",
        extraTextData,
        { name: name.trim() }
      );
      await t.commit();
      return generalResponse(
        res,
        company,
        "Your company has been successfully registered in the platform, and we informed that your admin email has already been added, so we'll not update any information of user."
      );
    } else {
      const user = await createUser(
        {
          name: admin_name,
          email: admin_email,
          password: admin_password,
          phone_number: admin_phone_number,
          zip_code: admin_zip_code ? admin_zip_code : null,
          address: admin_address ? admin_address : null,
          image_path,
        },
        t
      );

      await createCompanyUser(
        {
          company_id: company.id,
          role_id: adminRole.id,
          user_id: user.id,
          id_number,
          status: "ACTIVE",
        },
        t
      );
      let extraTextData = `<div>
        <span>
        Your username and password are listed below.</span>
        <span>Username: ${admin_email}</span>
        <span>password: ${admin_password}</span>
      </div>`;
      await sendMailHelper(
        admin_name,
        admin_email,
        "Company Registration",
        extraTextData,
        { name: name.trim() }
      );
      await t.commit();
      return generalResponse(
        res,
        company,
        "your company is successfully register in platform"
      );
    }
  } catch (e) {
    await t.rollback();
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
  getAllCompanies,
  getCompany,
  createCompany,
  updateCompany,
  deleteCompany,
  registerCompany,
};
