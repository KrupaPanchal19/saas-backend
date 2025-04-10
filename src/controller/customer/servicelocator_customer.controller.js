const generalResponse = require("../../helper/general_response.helper");
const {
  findServiceAresRestrictionMode,
} = require("../../repository/service_area_restriction.repository");
const {
  findAllServiceLocator,
} = require("../../repository/service_locator.repository");

const findAllServices = async (req, res) => {
  try {
    const data = await findAllServiceLocator({
      where: { company_id: req.company_id },
    });
    if (data !== null) {
      return generalResponse(res, data, "", "success", false, 200);
    } else {
      return generalResponse(res, [], "No Data Found", "success", false, 200);
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

const findServices = async (req, res) => {
  try {
    const data = await findAllServiceLocator({
      where: { company_id: req.company_id, zipcode: req.query.search },
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

    if (data) {
      return generalResponse(res, data.mode, "", "success", false, 200);
    } else {
      return generalResponse(
        res,
        [],
        "service locator mode not found",
        "error",
        false,
        200
      );
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
  findServices,
  findAllServices,
  findServiceMode,
};
