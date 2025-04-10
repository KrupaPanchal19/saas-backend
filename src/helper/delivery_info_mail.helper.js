const { findDelivery } = require("../repository/delivery.repository");
const db = require("../models/");

const DeliveryInfoMail = async (id, driverInfo = null) => {
  let whereCondition = {
    id,
  };
  const reletion = [
    {
      model: db.delivery_item,
      as: "delivery_items",
      required: false,
      attributes: ["item_quantity", "image", "item_id"],
      include: [
        {
          model: db.item,
          as: "item",
          required: false,
          paranoid: false,
          attributes: ["item_name"],
        },
      ],
    },
    {
      model: db.user,
      as: "customer",
      required: false,
      paranoid: false,
      attributes: ["name", "email"],
    },
    {
      model: db.user,
      as: "driver",
      required: false,
      paranoid: false,
      attributes: ["name", "email"],
    },
    {
      model: db.delivery_payment_log,
      as: "delivery_payment_log",
      paranoid: false,
      attributes: ["payment_status", "transaction_id", "createdAt", "type"],
      required: false,
    },
  ];
  let attributes = [
    "pickup_location",
    "destination_location",
    "expected_delivery_time",
    "destination_type",
    "store_name",
    "total_price",
  ];
  const data = await findDelivery({
    where: whereCondition,
    attributes,
    include: reletion,
  });
  const { customer, driver, delivery_items, delivery_payment_log, ...rest } =
    JSON.parse(JSON.stringify(data));
  let itemName = [];
  delivery_items.forEach((e) => {
    itemName.push(e.item.item_name);
  });

  const moment = require("moment");
  let extraTextData = `<div>
  <div style="width: 100%;float: left;">Here are the details of your delivery</div>
  <div style="width: 100%;float: left;">
    <span>Pickup Location : ${rest.pickup_location}</span><br/>
    <span>Destination Location : ${rest.destination_location}</span><br/>
    <span>Assigned Delivery Date & Time : ${moment(rest.expected_delivery_time)
      .utc()
      .format("MM-DD-YYYY hh:mm A")}</span><br/>
    <span>Items : ${itemName.toString()}</span><br/>  
    <span>Total Cost : ${rest.total_price ? rest.total_price : 0}</span>
    <br/>
    <span>Driver : ${driverInfo ? driverInfo.name : driver?.name}</span>
    <br/>
  </div>`;
  extraTextData += `</div>`;
  return extraTextData;
};

module.exports = { DeliveryInfoMail };
