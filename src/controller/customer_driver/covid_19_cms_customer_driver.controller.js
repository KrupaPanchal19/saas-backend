const generalResponse = require("../../helper/general_response.helper");
const { findCovid19CMS } = require("../../repository/covid_19_cms.repository");

const getCovidCms = async (req, res) => {
  try {
    const { name } = req.query;
    const resData = await findCovid19CMS({
      where: { name: name, company_id: req.company_id },
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

module.exports = { getCovidCms };
