const { updateUser } = require("../../repository/user.repository");
const generalResponse = require("../../helper/general_response.helper");
const sendMailHelper = require("../../helper/sendmail.helper");
const folderExistCheck = require("../../helper/folder_exist_check.helper");
const imageFilter = require("../../helper/image_filter.helper");
require("dotenv").config();

const updateCustomer = async (req, res) => {
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
  try {
    let update = Object.keys(req.body);
    if (req.files) {
      update.push(Object.keys(req.files).toString());
    }
    const allowUpdate = ["id", "name", "password", "address", "image_path"];
    const invalidOP = update.every((update) => allowUpdate.includes(update));
    if (!invalidOP) {
      return generalResponse(
        res,
        [],
        "Invalid operation!!",
        "error",
        true,
        200
      );
    } else {
      const updatedArray = req.body;
      for (let prop_name in updatedArray) {
        if (prop_name === "password" && updatedArray[prop_name] === "") {
          delete updatedArray[prop_name];
        } else if (prop_name === "name" && updatedArray[prop_name] === "") {
          delete updatedArray[prop_name];
        } else if (updatedArray[prop_name] === "") {
          updatedArray[prop_name] = null;
        }
      }
      if (updatedArray["password"]) {
        await sendMailHelper(
          req.user.name,
          req.user.email,
          "Your Password has been Updated",
          null,
          req.company
        );
      }
      const user_id = req["user"].id;
      if (req.files) {
        const file = req.files.image_path;
        let fileName = file.name.replace(/\s/g, "_");
        const fileExtRes = imageFilter(fileName);
        if (fileExtRes === true) {
          const current_date = new Date();
          let seconds = Math.round(current_date.getTime() / 1000);
          let filename = seconds + "_" + fileName;
          const folderCheck = folderExistCheck(`./public/customer/`);
          if (folderCheck) {
            file.mv(`./public/customer/${filename}`, async (err) => {
              if (err) {
                return generalResponse(
                  res,
                  [],
                  "Customer profile is not updated!!",
                  "error",
                  true,
                  200
                );
              } else {
                updatedArray["image_path"] = `/customer/${filename}`;
                await updateUser(updatedArray, { id: user_id });
                const customerImage = process.env.API + `/customer/${filename}`;
                return generalResponse(
                  res,
                  customerImage,
                  "Customer profile is updated",
                  "success",
                  true,
                  200
                );
              }
            });
          } else {
            return generalResponse(
              res,
              [],
              "Customer profile is not updated!!",
              "error",
              true,
              200
            );
          }
        } else {
          return generalResponse(
            res,
            [],
            "Only image files are allowed like jpg,jpge or png!",
            "error",
            true,
            200
          );
        }
      } else {
        await updateUser(updatedArray, { id: user_id });
        return generalResponse(
          res,
          [],
          "Customer profile is updated",
          "success",
          true,
          200
        );
      }
    }
  } catch (e) {
    return generalResponse(
      res,
      [],
      "Something went wrong!!",
      "error",
      false,
      200
    );
  }
};

module.exports = { updateCustomer };
