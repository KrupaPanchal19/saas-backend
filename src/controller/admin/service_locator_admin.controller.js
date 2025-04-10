const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const generalResponse = require("../../helper/general_response.helper");
const {
  findAllServiceLocator,
  findAndCountAllServiceLocator,
  findServiceLocator,
  bulkCreateServiceLocator,
  updateServiceLocator,
  deleteServiceLocator: deleteServiceLocatorRepo,
} = require("../../repository/service_locator.repository");

const {
  findServiceAresRestrictionMode,
  updateServiceAresRestrictionMode,
} = require("../../repository/service_area_restriction.repository");

const addServiceLocator = async (req, res) => {
  try {
    const { city, state, zipcode } = req.body;
    const zipcodeData = await findAllServiceLocator({
      where: { zipcode: zipcode },
      attributes: ["zipcode"],
    });
    if (zipcodeData) {
      zipcodeData.forEach((e) => {
        const index = zipcode.indexOf(e.zipcode);
        if (index > -1) {
          zipcode.splice(index, 1);
        }
      });
    }
    const data = zipcode.map((e) => ({
      city: city,
      state: state,
      zipcode: e,
      company_id: req.company_id,
    }));
    if (data.length > 0) {
      await bulkCreateServiceLocator(data);
      return generalResponse(
        res,
        [],
        "Service locator added",
        "success",
        true,
        200
      );
    } else {
      return generalResponse(
        res,
        [],
        "Service locator already added",
        "error",
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
const editServiceLocator = async (req, res) => {
  const update = Object.keys(req.body);
  const allowUpdate = ["id", "zipcode", "city", "state"];
  const invalidOP = update.every((update) => allowUpdate.includes(update));
  if (!invalidOP) {
    return generalResponse(res, [], "Invalid operation!!", "error", true, 200);
  }
  try {
    const { id, zipcode, city, state } = req.body;
    const updateData = {
      zipcode: zipcode[0],
      city,
      state,
    };
    await updateServiceLocator(updateData, { id });
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
const getServiceLocators = async (req, res) => {
  try {
    let limit = 10;
    let offset = (req.query.page - 1) * 10;
    const filterData = req.query.filterData;
    let where = {
      company_id: req.company_id,
    };
    if (filterData) {
      where = {
        ...where,
        [Op.or]: [
          { zipcode: { [Op.like]: "%" + filterData + "%" } },
          { state: { [Op.like]: "%" + filterData + "%" } },
          { city: { [Op.like]: "%" + filterData + "%" } },
        ],
      };
    }
    let attributes = ["id", "zipcode", "city", "state"];
    const data = await findAndCountAllServiceLocator({
      where,
      limit,
      offset,
      attributes,
      order: [["updatedAt", "DESC"]],
      $sort: { id: 1 },
    });
    if (data && data.rows && data.rows.length > 0) {
      return generalResponse(res, [data], "");
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
const getServiceLocator = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    let where = { id };
    const attributes = ["id", "zipcode", "city", "state"];
    const data = await findServiceLocator({ where, attributes });
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
const deleteServiceLocator = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await deleteServiceLocatorRepo({ id });
    return generalResponse(
      res,
      [],
      "zipcode deleted successfully",
      "success",
      true,
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

const findServices = async (req, res) => {
  try {
    const data = await findServiceLocator({
      where: { zipcode: req.query.search, company_id: req.company_id },
    });
    if (data !== null) {
      return generalResponse(res, true, "", "success", false, 200);
    } else {
      return generalResponse(res, false, "", "success", false, 200);
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

const findServiceMode = async (req, res) => {
  try {
    const data = await findServiceAresRestrictionMode({
      where: { company_id: req.company_id },
    });
    return generalResponse(res, data.mode, "", "success", false, 200);
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

const updateServiceMode = async (req, res) => {
  try {
    const data = req.body;
    await updateServiceAresRestrictionMode(data, {
      company_id: req.company_id,
    });
    return generalResponse(res, [], "", "success", false, 200);
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
  addServiceLocator,
  editServiceLocator,
  getServiceLocators,
  getServiceLocator,
  deleteServiceLocator,
  findServices,
  findServiceMode,
  updateServiceMode,
};
