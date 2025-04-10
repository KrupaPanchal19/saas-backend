require("dotenv").config();
const axios = require("axios");
const db = require("../models/");

const {
  findDelivery,
  updateDelivery,
} = require("../repository/delivery.repository");
const { findAllPrice } = require("../repository/price.repository");

const calculateTotalPrice = async (
  company_id,
  {
    flights_stairs,
    pickup_latitude,
    pickup_longitude,
    destination_latitude,
    destination_longitude,
    delivery_id,
    heavy_item,
    destination_type,
    delivery_items,
    value_of_item,
    assembly,
    discount = 0,
    discount_type = "$",
  },
  statusOfId = true
) => {
  let totalPrice = 0;
  let priceInfo = {};
  let resPrizeInfo = [];
  let googleMile;
  const priceData = await findAllPrice({
    where: { company_id },
  });
  const priceDataJsonTable = JSON.parse(JSON.stringify(priceData));
  let priceDataJson = {};
  priceDataJsonTable.forEach((e) => {
    priceDataJson[`${e.key}`] = e.value;
  });
  const url = `${process.env.GOOGLE_DISTANCE_URL}?units=imperial&origins=${pickup_latitude},${pickup_longitude}&destinations=${destination_latitude},${destination_longitude}&key=${process.env.GOOGLE_KEY}`;
  const distance_res = await axios.get(url);
  const googleStatus = distance_res.data.rows?.[0]?.elements?.[0]?.status;
  if (googleStatus === "OK") {
    googleMile = distance_res.data.rows?.[0]?.elements?.[0]?.distance.value;
  } else {
    return { total: 0, price_info: [] };
  }

  const mile = Math.ceil(googleMile * 0.000621371);
  let milePrice = 0;
  if (mile > parseFloat(priceDataJson.base_mile)) {
    const diffOfMile = parseFloat(mile) - parseFloat(priceDataJson.base_mile);
    milePrice = diffOfMile * parseFloat(priceDataJson.per_mile);
  }

  resPrizeInfo.push({
    key: "Miles",
    value: parseFloat(mile).toString(),
  });
  resPrizeInfo.push({
    key: "Flat Fee Radius",
    value: parseFloat(priceDataJson.base_mile).toString(),
  });

  let priceForHeavyItem = 0;
  let priceForAssembly = 0;
  let priceForInsurance = 0;
  if (heavy_item === "yes") {
    priceForHeavyItem = priceDataJson.heavy_item_price;
  }

  const NameOfMainKey = [
    "publicKey",
    "privateKey",
    "base_mile",
    "per_mile",
    "heavy_item_price",
    "insurance",
    "assembly",
  ];
  let extraAdditionPriceName = [];
  Object.keys(priceDataJson).forEach((e) => {
    if (!NameOfMainKey.includes(e)) extraAdditionPriceName.push(e);
  });
  extraAdditionPriceName.forEach((e) => {
    totalPrice += parseFloat(priceDataJson[`${e}`]);
    priceInfo[`${e}`] = parseFloat(priceDataJson[`${e}`]);
    resPrizeInfo.push({
      key: `${e}`,
      value: parseFloat(priceDataJson[`${e}`]).toFixed(2) * 1,
    });
  });

  if (assembly) {
    priceForAssembly = priceDataJson.assembly ? priceDataJson.assembly : 0;
  }

  if (value_of_item) {
    priceForInsurance =
      priceDataJson.insurance && value_of_item > 0
        ? (priceDataJson.insurance / 100) * value_of_item
        : 0;
  }

  priceInfo.milePrice = parseFloat(milePrice).toFixed(2);
  priceInfo.priceForHeavyItem = parseFloat(priceForHeavyItem).toFixed(2);
  priceInfo.insurance = priceForInsurance
    ? parseFloat(priceForInsurance).toFixed(2)
    : 0;
  priceInfo.assembly = parseFloat(priceForAssembly).toFixed(2);

  resPrizeInfo.push({
    key: "Assembly Fee",
    value: (parseFloat(priceForAssembly) * 1).toFixed(2),
  });
  resPrizeInfo.push({
    key: "Insurance Fee",
    value: (parseFloat(priceForInsurance) * 1).toFixed(2),
  });
  resPrizeInfo.push({
    key: `Per Mile Fee Over Radius $${parseFloat(priceDataJson.per_mile)}/Mile`,
    value: (parseFloat(milePrice) * 1).toFixed(2),
  });
  resPrizeInfo.push({
    key: "Heavy Item Fee",
    value: (parseFloat(priceForHeavyItem) * 1).toFixed(2),
  });

  // for item price

  let resItemInfo = [];

  if (delivery_items.length > 0) {
    delivery_items.forEach((e) => {
      if (parseFloat(e.flat_rate).toFixed("2") > 0)
        totalPrice += parseFloat(
          parseInt(e.quantity) * parseFloat(e.flat_rate).toFixed("2")
        );
      resItemInfo.push({
        key: e.name,
        value: (parseInt(e.quantity) * parseFloat(e.flat_rate)).toFixed("2"),

        show_item_per_price: parseFloat(e.flat_rate).toFixed("2"),

        show_quantity: parseInt(e.quantity),
      });
      priceInfo[`${e.name}`] = `${parseInt(e.quantity)} * ${parseFloat(
        e.flat_rate
      ).toFixed("2")} = ${(
        parseInt(e.quantity) * parseFloat(e.flat_rate)
      ).toFixed("2")}`;
    });
  }

  totalPrice += parseFloat(milePrice);
  totalPrice += parseFloat(priceForHeavyItem);
  totalPrice += parseFloat(priceForAssembly);
  totalPrice += parseFloat(priceForInsurance);
  let afterDiscountPrice;
  if (discount === "") {
    discount = 0;
  }
  if (discount !== 0) {
    if (discount_type === "%") {
      afterDiscountPrice =
        parseFloat(totalPrice) -
        (parseFloat(totalPrice) * parseFloat(discount)) / 100;
    } else {
      afterDiscountPrice = parseFloat(totalPrice) - parseFloat(discount);
    }
  } else {
    afterDiscountPrice = totalPrice;
  }

  priceInfo.discount =
    discount_type === "%"
      ? discount + " " + discount_type
      : discount_type + " " + discount;
  priceInfo.after_discount_price = parseFloat(
    afterDiscountPrice.toFixed(2)
  ).toFixed(2);
  priceInfo.before_discount_price = parseFloat(totalPrice.toFixed(2)).toFixed(
    2
  );
  dbPrice = {
    total_price: parseFloat(afterDiscountPrice.toFixed(2)).toFixed(2),
    total_info: priceInfo,
  };
  let resUpdate;
  if (statusOfId) {
    resUpdate = await updateDelivery(dbPrice, { id: delivery_id });
  }

  if (statusOfId === true && !resUpdate[0]) {
    return {
      total: parseFloat(totalPrice.toFixed(2)).toFixed(2),
      price_info: resPrizeInfo,
      after_discount_price: parseFloat(afterDiscountPrice.toFixed(2)).toFixed(
        2
      ),
    };
  } else {
    return {
      total: parseFloat(totalPrice.toFixed(2)).toFixed(2),
      price_info: resPrizeInfo,
      item_info: resItemInfo,
      discount:
        discount_type === "%"
          ? discount + " " + discount_type
          : discount_type + " " + discount,
      after_discount_price: parseFloat(afterDiscountPrice.toFixed(2)).toFixed(
        2
      ),
    };
  }
};

const priceUpdateWithId = async (id, company_id) => {
  try {
    let where = {
      id,
    };
    let attributes = [
      "pikup_point",
      "destination_point",
      "item_heavy",
      "destination_type",
      "destination_stair_info",
      "value_of_item",
      "assembly",
      "discount",
      "discount_type",
    ];
    let include = [
      {
        model: db.delivery_item,
        as: "delivery_items",
        required: false,
        attributes: ["item_quantity", "description"],
        include: [
          {
            model: db.item,
            as: "item",
            paranoid: false,
            attributes: ["item_name", "flat_rate"],
            required: false,
          },
        ],
      },
    ];

    const data = await findDelivery({
      where,
      include,
      attributes,
    });
    if (data) {
      const jsonData = JSON.parse(JSON.stringify(data));

      let pickup_latitude = jsonData.pikup_point.coordinates[0];
      let pickup_longitude = jsonData.pikup_point.coordinates[1];
      let destination_latitude = jsonData.destination_point.coordinates[0];
      let destination_longitude = jsonData.destination_point.coordinates[1];
      let flights_stairs = parseInt(jsonData.destination_stair_info);
      let heavy_item = jsonData.item_heavy;
      let destination_type = jsonData.destination_type;
      let value_of_item = jsonData.value_of_item;
      let assembly = jsonData.assembly;
      let discount = jsonData.discount ? jsonData.discount : 0;
      let discount_type = jsonData.discount_type ? jsonData.discount_type : "$";
      let delivery_items = [];
      if (jsonData.delivery_items && jsonData.delivery_items.length > 0) {
        delivery_items = jsonData.delivery_items.map((e) => ({
          quantity: e.item_quantity,
          name:
            e.item.item_name + (e.description ? "(" + e.description + ")" : ""),
          flat_rate: e.item.flat_rate,
        }));
      }
      const calculateData = await calculateTotalPrice(company_id, {
        flights_stairs,
        pickup_latitude,
        pickup_longitude,
        destination_latitude,
        destination_longitude,
        delivery_id: id,
        heavy_item,
        destination_type,
        delivery_items,
        value_of_item,
        assembly,
        discount,
        discount_type,
      });
      //for stripe total price in cent
      calculateData.totalInCent = Math.round(
        parseFloat(calculateData.after_discount_price) * 100
      );
      return calculateData;
    } else {
      return new Error("Delivery data not found");
    }
  } catch (e) {
    return new Error();
  }
};

module.exports = { calculateTotalPrice, priceUpdateWithId };
