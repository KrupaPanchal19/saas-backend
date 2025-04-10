const Sequelize = require("sequelize");
const Op = Sequelize.Op;

const generalResponse = require("../../helper/general_response.helper");

const {
  findAndCountAllContactUs,
  deleteContactUs: deleteContactUsRepo,
} = require("../../repository/contact_us.repository");

const getAllContactUs = async (req, res) => {
  try {
    let limit = 10;
    let offset = (req.query.page - 1) * 10;
    const filterData = req.query.filterData;
    let where = { company_id: req.company_id };
    if (filterData) {
      where = {
        ...where,
        [Op.or]: [
          { name: { [Op.like]: "%" + filterData + "%" } },
          { email: { [Op.like]: "%" + filterData + "%" } },
          { message: { [Op.like]: "%" + filterData + "%" } },
          { phone_number: { [Op.like]: "%" + filterData + "%" } },
        ],
      };
    }
    let attributes = ["id", "name", "email", "phone_number", "message"];
    const data = await findAndCountAllContactUs({
      where,
      limit,
      offset,
      attributes,
      order: [["createdAt", "DESC"]],
      $sort: { id: 1 },
    });
    if (data && data.rows && data.rows.length > 0) {
      return generalResponse(res, [data], "");
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
const deleteContactUs = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await deleteContactUsRepo({ id, company_id: req.company_id });
    return generalResponse(
      res,
      [],
      "contact us deleted successfully",
      "success",
      true,
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

module.exports = { getAllContactUs, deleteContactUs };
