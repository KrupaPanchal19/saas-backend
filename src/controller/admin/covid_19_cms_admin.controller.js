const generalResponse = require("../../helper/general_response.helper");
const {
  createCovid19CMS,
  findCovid19CMS,
  updateCovid19CMS,
} = require("../../repository/covid_19_cms.repository");

const insertCovidCms = async (req, res) => {
  try {
    const { name, html } = req.body;
    const check = await findCovid19CMS({
      where: {
        name: name,
        company_id: req.company_id,
      },
    });
    if (check !== null) {
      await updateCovid19CMS(
        { name, html },
        { name: name, company_id: req.company_id }
      );
      return generalResponse(
        res,
        [],
        "Covid-19 Page updated successfully",
        "success",
        true,
        200
      );
    } else {
      await createCovid19CMS({ name, html, company_id: req.company_id });
      return generalResponse(
        res,
        [],
        "Covid-19 Page create successfully",
        "success",
        true,
        200
      );
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

const getCovidCms = async (req, res) => {
  try {
    const { name } = req.query;
    const resData = await findCovid19CMS({
      where: { name, company_id: req.company_id },
    });
    return generalResponse(res, resData, "", "success", false, 200);
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

module.exports = { insertCovidCms, getCovidCms };
