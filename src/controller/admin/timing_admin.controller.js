const moment = require("moment");

const Sequelize = require("sequelize");
const Op = Sequelize.Op;

const generalResponse = require("../../helper/general_response.helper");
const {
  findAllDayBlockTime,
  createDayBlockTime,
  deleteDayBlockTime,
} = require("../../repository/day_block_time.repository");

const addTiming = async (req, res) => {
  try {
    const update = Object.keys(req.body);
    const allowUpdate = ["from", "to", "days"];
    const invalidOP = update.every((update) => allowUpdate.includes(update));
    if (!invalidOP) {
      return generalResponse(res, [], "invalid operation", "error");
    }
    const { from, to, days } = req.body;
    const resData = await createDayBlockTime({
      company_id: req.company_id,
      day: days,
      from_time: from,
      to_time: to,
    });
    if (resData != []) {
      return generalResponse(res, [], "Timing added", "success", false, 200);
    } else {
      return generalResponse(
        res,
        [],
        "Timing is not added",
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

const getAllTiming = async (req, res) => {
  try {
    const data = await findAllDayBlockTime({
      attributes: ["from_time", "to_time", "day"],
      where: {
        company_id: req.company_id,
      },
    });
    if (data && data !== [] && data.length > 0) {
      return generalResponse(res, JSON.parse(JSON.stringify(data)));
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

const deleteTiming = async (req, res) => {
  try {
    await deleteDayBlockTime({ id: req.params.id });
    return generalResponse(
      res,
      [],
      "deleted successfully",
      "success",
      false,
      200
    );
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

const getAllTimingsForCalender = async (req, res) => {
  try {
    let resData = [];
    let dayIndex;
    const days = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    const attributes = ["from_time", "to_time", "day", "id"];
    const where = { company_id: req.company_id };
    let data = await findAllDayBlockTime({ attributes, where });
    if (data && data !== [] && data.length > 0) {
      data = JSON.parse(JSON.stringify(data));
      data.forEach((e) => {
        if (days.includes(e.day)) {
          dayIndex = days.indexOf(e.day);
          resData.push({
            title: `${moment(e.from_time, ["HH:mm"]).format(
              "hh:mm A"
            )} - ${moment(e.to_time, ["HH:mm"]).format("hh:mm A")}`,
            start: moment(e.from_time, ["HH:mm"]).format("hh:mm A"),
            end: moment(e.to_time, ["HH:mm"]).format("hh:mm A"),
            daysOfWeek: [dayIndex],
            status: "block_time",
            id: e.id,
          });
        }
      });
      return generalResponse(res, resData);
    } else {
      return generalResponse(res, [], "No data found!!", "success", false, 200);
    }
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
  addTiming,
  getAllTiming,
  deleteTiming,
  getAllTimingsForCalender,
};
