const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const moment = require("moment");
const generalResponse = require("../../helper/general_response.helper");
const {
  findAllHolidays,
  findHolidays,
  createHolidays,
  updateHolidays,
  deleteHolidays: deleteHolidaysRepo,
} = require("../../repository/holidays.repository");

const addHolidays = async (req, res) => {
  try {
    const { name, date } = req.body;
    const dateData = await findHolidays({
      where: { date, company_id: req.company_id },
    });
    if (dateData) {
      return generalResponse(
        res,
        [],
        "Date is already exist!!",
        "error",
        true,
        200
      );
    } else {
      await createHolidays({ name, date, company_id: req.company_id });
      return generalResponse(res, [], "Holidays added", "success", true, 200);
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
const editHolidays = async (req, res) => {
  const update = Object.keys(req.body);
  const allowUpdate = ["id", "name", "date"];
  const invalidOP = update.every((update) => allowUpdate.includes(update));
  if (!invalidOP) {
    return generalResponse(res, [], "Invalid operation!!", "error", true, 200);
  }
  try {
    const { id, name, date } = req.body;
    const updateData = {
      name,
      date,
    };
    await updateHolidays(updateData, { id: parseInt(id) });
    return generalResponse(res, [], "Data Updated", "success", true, 200);
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

const getHolidays = async (req, res) => {
  try {
    let where = {
      id: parseInt(req.params.id),
    };
    let attributes = ["id", "name", "date"];
    const data = await findHolidays({ where, attributes });
    if (data !== null) {
      const jsonData = JSON.parse(JSON.stringify(data));
      return generalResponse(res, jsonData);
    } else {
      return generalResponse(res, [], "No data found!!", "success", true, 200);
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

const getAllHolidays = async (req, res) => {
  try {
    let attributes = ["id", "name", "date"];
    const data = await findAllHolidays({
      attributes,
      where: { company_id: req.company_id },
    });
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

const getAllHolidaysForCalender = async (req, res) => {
  try {
    let resData;
    let jsonData = [];
    let attributes = ["id", "name", "date"];
    let where = { company_id: req.company_id };
    const data = await findAllHolidays({ attributes, where });
    if (data.length > 0) {
      resData = JSON.parse(JSON.stringify(data));
      resData.map((e) =>
        jsonData.push({
          title: `${e.name}`,
          start: moment(e.date, ["MM-DD-YYYY"]).format("YYYY-MM-DD"),
          end: moment(e.date, ["MM-DD-YYYY"]).format("YYYY-MM-DD"),
          // start: moment(e.date).utc().format("X"),
          // end: moment(e.date).utc().format("X"),
          date: moment(e.date).format("MM-DD-YYYY"),
          id: e.id,
          status: "holiday",
          // rendering: "background",
          // color: "#e8fde7",
        })
      );
      return generalResponse(res, jsonData, "");
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

const deleteHolidays = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await deleteHolidaysRepo({ id });
    return generalResponse(res, [], "Holidays deleted successfully", "success");
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
  addHolidays,
  editHolidays,
  getHolidays,
  getAllHolidays,
  deleteHolidays,
  getAllHolidaysForCalender,
};
