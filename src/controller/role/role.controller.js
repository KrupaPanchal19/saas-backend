require("dotenv").config();
const generalResponse = require("../../helper/general_response.helper");

const {
  findAllRole,
  createRole: createRoleRepo,
  deleteRole: deleteRoleRepo,
} = require("../../repository/role.repository");

const getAllRoles = async (req, res) => {
  try {
    const roleData = await findAllRole();
    return generalResponse(res, roleData);
  } catch (e) {
    return generalResponse(
      res,
      e,
      "Something went wrong!!",
      "error",
      false,
      200
    );
  }
};

const createRole = async (req, res) => {
  try {
    const role = await createRoleRepo(req.body);
    return generalResponse(res, role, "role created successfully");
  } catch (e) {
    return generalResponse(
      res,
      e,
      "Something went wrong!!",
      "error",
      false,
      200
    );
  }
};

const deleteRole = async (req, res) => {
  try {
    const roleId = req.params.id;
    await deleteRoleRepo({ id: roleId });
    return generalResponse(
      res,
      null,
      "role deleted successfully",
      "success",
      true
    );
  } catch (e) {
    return generalResponse(
      res,
      e,
      "Something went wrong!!",
      "error",
      false,
      200
    );
  }
};

module.exports = { getAllRoles, createRole, deleteRole };
