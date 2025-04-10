const generalResponse = require("../../helper/general_response.helper");
const Sequelize = require("sequelize");
const {
  findCompanyUser,
  updateCompanyUser,
} = require("../../repository/company_user.repository");
const { findAllDelivery } = require("../../repository/delivery.repository");
const Op = Sequelize.Op;
const db = require("../../models/");

const editUserStatus = async (req, res) => {
  try {
    const comany_user_data = await findCompanyUser({
      where: { user_id: req.body.id, company_id: req.company_id },
      attributes: ["id"],
      include: [
        {
          model: db.role,
          attributes: ["name"],
          paranoid: false,
        },
      ],
    });
    let deliveryResponse;
    if (comany_user_data.role.name === "customer") {
      deliveryResponse = await findAllDelivery({
        where: {
          user_id: req.body.id,
          status: {
            [Op.not]: ["COMPLETED", "REVIEWED"],
          },
        },
        attributes: ["id"],
      });
    } else {
      deliveryResponse = await findAllDelivery({
        where: {
          driver_id: req.body.id,

          status: {
            [Op.not]: ["COMPLETED", "REVIEWED"],
          },
        },
        attributes: ["id"],
      });
    }

    const update = Object.keys(req.body);
    const allowUpdate = ["status", "id"];
    const invalidOP = update.every((update) => allowUpdate.includes(update));
    if (!invalidOP) {
      return generalResponse(res, [], "invalid operation", "error");
    }

    if (deliveryResponse.length === 0) {
      await updateCompanyUser(
        { status: req.body.status },
        { id: comany_user_data.id }
      );
      return generalResponse(res, [], "done");
    } else {
      return generalResponse(
        res,
        [],
        "Not able to inactive this",
        "error",
        true
      );
    }
  } catch (e) {
    console.log(e, "error");

    return generalResponse(res, [], "something wrong", "error");
  }
};

module.exports = {
  editUserStatus,
};
