const generalResponse = require("../../helper/general_response.helper");
const { findAllItems } = require("../../repository/item.repository");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

const findAllItem = async (req, res) => {
  try {
    let whereCondition;
    if (req.query.search) {
      whereCondition = {
        [Op.and]: [
          {
            status: "ACTIVE",
          },
          {
            [Op.or]: [
              {
                item_name: {
                  [Op.like]: "%" + req.query.search + "%",
                },
              },
            ],
          },
        ],
      };
    } else {
      whereCondition = {
        status: "ACTIVE",
      };
    }

    whereCondition = { company_id: req.company_id, ...whereCondition };

    let attributes = ["id", "item_name", "item_image"];
    const data = await findAllItems({
      where: whereCondition,
      attributes,
      $sort: { id: 1 },
    });
    if (data && data.length > 0) {
      const itemData = JSON.parse(JSON.stringify(data));
      return generalResponse(res, itemData);
    } else {
      return generalResponse(
        res,
        data,
        "No data found!!",
        "success",
        false,
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

module.exports = {
  findAllItem,
};
