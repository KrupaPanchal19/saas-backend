const generalResponse = require("../../helper/general_response.helper");
const {
  priceUpdateWithId,
  calculateTotalPrice,
} = require("../../helper/price.helper");
const { findAllItems } = require("../../repository/item.repository");

const Sequelize = require("sequelize");
const Op = Sequelize.Op;

require("dotenv").config();

const getTotalPrice = async (req, res) => {
  try {
    const { delivery_id } = req.body;
    // let where = {
    //   id: delivery_id,
    // };
    // let attribute = [
    //   "pikup_point",
    //   "destination_point",
    //   "item_heavy",
    //   "destination_type",
    //   "destination_stair_info",
    //   "value_of_item",
    //   "assembly",
    // ];
    // let relation = [
    //   {
    //     model: db.delivery_item,
    //     as: "delivery_items",
    //     required: false,
    //     attributes: ["item_quantity"],
    //     include: [
    //       {
    //         model: db.item,
    //         as: "item",
    //         paranoid: false,
    //         attributes: [
    //           "item_name",
    //           "flat_rate",
    //           "extra_heavy",
    //           "spacial_handling",
    //         ],
    //         required: false,
    //       },
    //     ],
    //   },
    // ];

    // const data = await getDeliveryParticularWithRelation(
    //   where,
    //   relation,
    //   attribute
    // );
    // if (data) {
    //   const jsonData = JSON.parse(JSON.stringify(data));
    //   let pickup_latitude = jsonData.pikup_point.coordinates[0];
    //   let pickup_longitude = jsonData.pikup_point.coordinates[1];
    //   let destination_latitude = jsonData.destination_point.coordinates[0];
    //   let destination_longitude = jsonData.destination_point.coordinates[1];
    //   let flights_stairs = parseInt(jsonData.destination_stair_info);
    //   let heavy_item = jsonData.item_heavy;
    //   let destination_type = jsonData.destination_type;
    //   let value_of_item = jsonData.value_of_item;
    //   let assembly = jsonData.assembly;
    //   let delivery_items = [];
    //   if (jsonData.delivery_items && jsonData.delivery_items.length > 0) {
    //     delivery_items = jsonData.delivery_items.map((e) => ({
    //       quantity: e.item_quantity,
    //       name: e.item.item_name,
    //       flat_rate: e.item.flat_rate,
    //       extra_heavy: e.item.extra_heavy,
    //       spacial_handling: e.item.spacial_handling,
    //     }));
    //   }

    //   const calculateData = await calculateTotalPrice({
    //     flights_stairs,
    //     pickup_latitude,
    //     pickup_longitude,
    //     destination_latitude,
    //     destination_longitude,
    //     delivery_id,
    //     heavy_item,
    //     destination_type,
    //     delivery_items,
    //     value_of_item,
    //     assembly,
    //   });

    //   //for stripe total price in cent
    //   calculateData.totalInCent = Math.round(
    //     parseFloat(calculateData.total) * 100
    //   );
    const calculateData = await priceUpdateWithId(delivery_id, req.company_id);
    if (calculateData.total) {
      return generalResponse(res, calculateData, "", "success", false, 200);
    } else {
      return generalResponse(
        res,
        [],
        "total price is not available",
        "error",
        false,
        200
      );
    }
    // } else {
    //   return generalResponse(
    //     res,
    //     [],
    //     "Delivery data not found",
    //     "success",
    //     false,
    //     200
    //   );
    // }
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

const calculationCharges = async (req, res) => {
  try {
    const { items, ...rest } = req.body;
    const item = JSON.parse(items);
    const itemIds = item.map((e) => e.id);
    const itemData = await findAllItems({
      where: { id: { [Op.in]: itemIds } },
      attributes: ["id", "item_name", "flat_rate"],
      $sort: { id: 1 },
    });
    // if (itemData && itemData.length > 0) {
    //   delivery_items = JSON.parse(JSON.stringify(itemData)).map((e) => {
    //     const ids = item.findIndex((e1) => (e1.id = e.id));
    //     return {
    //       quantity: item[ids].item_quantity,
    //       name: e.item_name,
    //       flat_rate: e.flat_rate,
    //       extra_heavy: e.extra_heavy,
    //       spacial_handling: e.spacial_handling,
    //     };
    //   });
    // }

    if (itemData && itemData.length > 0) {
      const jsonItemData = JSON.parse(JSON.stringify(itemData));
      delivery_items = item.map((e) => {
        const itemInfoIndex = jsonItemData.findIndex((e1) => e1.id == e.id);
        return {
          quantity: e.item_quantity,
          name:
            jsonItemData[itemInfoIndex].item_name + "(" + e.description + ")",
          flat_rate: jsonItemData[itemInfoIndex].flat_rate,
        };
      });
    }

    const data = await calculateTotalPrice(
      req.company_id,
      { ...rest, delivery_items },
      false
    );
    return generalResponse(res, data, "", "success", false);
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
  getTotalPrice,
  calculationCharges,
};
