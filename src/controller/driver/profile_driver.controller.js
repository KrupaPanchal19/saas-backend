const generalResponse = require("../../helper/general_response.helper");
const db = require("../../models/");
const { updateUser } = require("../../repository/user.repository");
const {
  deleteDriverCarInfo,
  createDriverCarInfo,
} = require("../../repository/driver_car_info.repository");
const sendMailHelper = require("../../helper/sendmail.helper");
const imageFilter = require("../../helper/image_filter.helper");
const folderExistCheck = require("../../helper/folder_exist_check.helper");
const { findCompanyUser } = require("../../repository/company_user.repository");

const editDriver = async (req, res) => {
  if (req.body.email) {
    return generalResponse(
      res,
      [],
      "Email is not allowed to update!!",
      "error",
      true,
      200
    );
  }
  if (req.body.phone_number) {
    return generalResponse(
      res,
      [],
      "Phone number is not allowed to update!!",
      "error",
      true,
      200
    );
  }
  const update = Object.keys(req.body);
  const allowUpdate = [
    "name",
    "image_path",
    "driver_cdl_licence",
    "driver_need_helper",
    "driver_zipcode",
    "password",
    "car_info",
  ];
  const invalidedOP = update.every((update) => allowUpdate.includes(update));
  if (!invalidedOP) {
    return generalResponse(res, [], "invalided operation", "error");
  }
  try {
    const { car_info, image_path, driver_zipcode, ...rest } = req.body;

    if (rest.password === "") {
      delete rest.password;
    } else if (rest?.password) {
      await sendMailHelper(
        req.user.name,
        req.user.email,
        "Your Password has been Updated",
        null,
        req.company
      );
    }
    const id = req["user"].id;
    const company_user_data = await findCompanyUser({
      where: { company_id: req.company_id, user_id: id },
    });
    const company_user_id = company_user_data.id;
    const carData = JSON.parse(car_info);
    if (req.files !== null) {
      let file = req.files.image_path;
      let fileName = file.name.replace(/\s/g, "_");
      const fileExtRes = imageFilter(fileName);
      if (fileExtRes === true) {
        const current_date = new Date();
        let seconds = Math.round(current_date.getTime() / 1000);
        let filename = seconds + "_" + fileName;
        const folderCheck = folderExistCheck(`./public/driverProfile/`);
        if (folderCheck) {
          file.mv(`./public/driverProfile/${filename}`, async (err) => {
            if (err) {
              return generalResponse(
                res,
                [],
                "driver not inserted",
                "error",
                true
              );
            } else {
              const image_path = {
                image_path: `/driverProfile/${filename}`,
              };
              await updateUser(
                { ...image_path, zipcode: driver_zipcode, ...rest },
                { id: id }
              );
              await deleteDriverCarInfo({
                where: { company_user_id: company_user_id },
              });
              carData.map((e, index) => {
                if (!e.id) {
                  carData[index] = { ...e, company_user_id: company_user_id };
                } else {
                  delete carData[index].id;
                  carData[index] = { ...e, company_user_id: company_user_id };
                }
              });
              await createDriverCarInfo(carData);
              return generalResponse(res, [], "update driver successfully");
            }
          });
        }
      } else {
        return generalResponse(
          res,
          [],
          "Only image files are allowed like jpg,jpeg or png!",
          "error",
          true,
          200
        );
      }
    } else {
      await updateUser({ ...rest }, { id: id });
      await deleteDriverCarInfo({
        where: { company_user_id: company_user_id },
      });
      carData.map((e, index) => {
        if (!e.id) {
          carData[index] = { ...e, company_user_id: company_user_id };
        } else {
          delete carData[index].id;
          carData[index] = { ...e, company_user_id: company_user_id };
        }
      });
      await createDriverCarInfo(carData);
      return generalResponse(res, [], "update driver successfully");
    }
  } catch (e) {
    console.log(e);
    return generalResponse(res, [], "something wrong", "error");
  }
};

module.exports = { editDriver };
