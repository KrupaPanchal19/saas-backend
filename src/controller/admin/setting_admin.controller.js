const folderExistCheck = require("../../helper/folder_exist_check.helper");
const generalResponse = require("../../helper/general_response.helper");
const imageFilter = require("../../helper/image_filter.helper");
const {
  updateCompany,
  findCompany,
} = require("../../repository/company.repository");

const addSetting = async (req, res) => {
  try {
    let bodyData = req.body;
    if (req.files?.logo) {
      let image = req.files.logo;
      let imageName = image.name.replace(/\s/g, "_");
      const fileExtRes1 = imageFilter(imageName);
      if (fileExtRes1 === true) {
        const current_date = new Date();
        let seconds = Math.round(current_date.getTime() / 1000);
        let imageMainName = seconds + "_" + req.user.id + "_" + imageName;
        const folderCheck = folderExistCheck(`./public/settingImage/logo`);
        if (folderCheck) {
          await image.mv(
            `./public/settingImage/logo/${imageMainName}`,
            async (err) => {
              if (err) {
                return generalResponse(
                  res,
                  [],
                  "Something went wrong!!",
                  "error",
                  false
                );
              } else {
                let data = await updateCompany(
                  { ...bodyData, logo: `settingImage/logo/${imageMainName}` },
                  { id: req.company_id }
                );

                let data2 = await findCompany({
                  where: { id: req.company_id },
                });

                data2 = JSON.parse(JSON.stringify(data2));
                data2.logo = process.env.API + "/" + data2.logo;
                return generalResponse(
                  res,
                  data2,
                  "company data updated succesfully logo!!",
                  "success",
                  false,
                  200
                );
              }
            }
          );
        }
      } else {
        return generalResponse(
          res,
          [],
          "Only image files are allowed like jpg,jpeg or png!",
          "error",
          true
        );
      }
    }

    delete bodyData?.logo;
    let data = await updateCompany({ ...bodyData }, { id: req.company_id });
    let data2 = await findCompany({ where: { id: req.company_id } });

    data2 = JSON.parse(JSON.stringify(data2));
    data2.logo = process.env.API + "/" + data2.logo;
    return generalResponse(
      res,
      data2,
      "company data updated succesfully wirhout logo!!",
      "success",
      false,

      200
    );
  } catch (e) {
    console.log(e);
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

const getSetting = async (req, res) => {
  try {
    let data = JSON.parse(JSON.stringify(req.company));

    if (!(data.logo === null || data.logo === "")) {
      data.logo = process.env.API + "/" + data.logo;
    }

    return generalResponse(res, data, "", "success", false, 200);
  } catch (e) {
    console.log(e);
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

module.exports = {
  addSetting,
  getSetting,
};
