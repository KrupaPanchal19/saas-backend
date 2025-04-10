const generalResponse = require("../../helper/general_response.helper");
const {
  findAllDayBlockTime,
} = require("../../repository/day_block_time.repository");

const getTiming = async (req, res) => {
  try {
    let attributes = ["from_time", "to_time", "day"];
    const data = await findAllDayBlockTime({
      where: { company_id: req.company_id },
      attributes,
    });
    if (data && data !== [] && data.length > 0) {
      let resData = {};
      let jsonData = JSON.parse(JSON.stringify(data));
      jsonData.forEach((e) => {
        if (resData.hasOwnProperty(e.day)) {
          resData[e.day].push({ from: e.from_time, to: e.to_time });
        } else {
          resData[e.day] = [{ from: e.from_time, to: e.to_time }];
        }
      });
      return generalResponse(res, resData);
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
  getTiming,
};
