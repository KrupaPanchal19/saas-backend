const generalResponse = require("../../helper/general_response.helper");
const { findAllHolidays } = require("../../repository/holidays.repository");

const getsHolidays = async (req, res) => {
  try {
    let attributes = ["id", "name", "date"];
    let where = { company_id: req.company_id };
    const data = await findAllHolidays({where, attributes});
    if (data.length > 0) {
      return generalResponse(res, data, "");
    } else {
      return generalResponse(res, [], "No data found!!", "success", false, 200);
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

module.exports = {
  getsHolidays,
};
