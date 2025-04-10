require("dotenv").config();

const generalResponse = require("../../helper/general_response.helper");
const imageFilter = require("../../helper/image_filter.helper");
const folderExistCheck = require("../../helper/folder_exist_check.helper");

const {
  findAndCountAllItems,
  findItem,
  createItem: createItemRepo,
  updateItem: updateItemRepo,
  deleteItem: deleteItemRepo,
} = require("../../repository/item.repository");

const getAllItems = async (req, res) => {
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
          { item_name: { [Op.like]: "%" + filterData + "%" } },
          { status: { [Op.like]: "%" + filterData + "%" } },
        ],
      };
    }
    let attributes = ["id", "item_name", "item_image", "status", "flat_rate"];
    const data = await findAndCountAllItems({
      where,
      limit,
      offset,
      attributes,
      order: [["item_name", "ASC"]],
    });
    if (data && data.rows && data.rows.length > 0) {
      const itemData = JSON.parse(JSON.stringify(data));
      itemData.rows.map((data) => {
        Object.keys(data).includes("item_image") && data["item_image"] !== null
          ? (data["item_image"] = process.env.API + data["item_image"])
          : "";
      });
      return generalResponse(res, [itemData]);
    } else {
      return generalResponse(res, [], "No data found!!", "success", false, 200);
    }
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

const getItem = async (req, res) => {
  try {
    let where = {
      company_id: req.company_id,
      id: parseInt(req.params.id),
    };
    let attributes = ["id", "item_name", "item_image", "status", "flat_rate"];
    const data = await findItem({
      where,
      attributes,
    });
    if (data !== null) {
      const jsonData = JSON.parse(JSON.stringify(data));
      if (jsonData["item_image"] !== null) {
        jsonData["item_image"] = process.env.API + jsonData["item_image"];
      }
      return generalResponse(res, jsonData);
    } else {
      return generalResponse(res, [], "No data found!!", "success", false, 200);
    }
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

const createItem = async (req, res) => {
  try {
    const { ...rest } = req.body;
    Object.keys(rest).forEach((e) =>
      rest[`${e}`] === "" ||
      rest[`${e}`] === "undefined" ||
      rest[`${e}`] === "null"
        ? (rest[`${e}`] = null)
        : null
    );
    rest.company_id = req.company_id;
    if (req.files && req.files.item_image) {
      let file = req.files.item_image;
      let fileName = file.name.replace(/\s/g, "_");
      const fileExtRes = imageFilter(fileName);
      if (!fileExtRes) {
        return generalResponse(
          res,
          [],
          "Only image files are allowed like jpg,jpeg or png!",
          "error",
          true,
          200
        );
      }
      const current_date = new Date();
      let seconds = Math.round(current_date.getTime() / 1000);
      let filename = seconds + "_" + fileName;
      const folderCheck = folderExistCheck(`./public/item/`);
      if (folderCheck) {
        file.mv(`./public/item/${filename}`, async (err) => {
          if (err) {
            throw new Error("file not move in folder");
          } else {
            rest.item_image = `/item/${filename}`;
            await createItemRepo(rest);
            return generalResponse(res, null, "Item added successfully");
          }
        });
      }
    } else {
      await createItemRepo(rest);
      return generalResponse(res, null, "Item added successfully");
    }
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

const updateItem = async (req, res) => {
  const update = Object.keys(req.body);
  const allowUpdate = ["id", "item_name", "status", "item_image", "flat_rate"];
  const invalidedOP = update.every((update) => allowUpdate.includes(update));
  if (!invalidedOP) {
    return generalResponse(res, [], "invalided operation", "error");
  }
  try {
    const { id, ...rest } = req.body;
    const notNullFiled = ["item_name", "status"];
    Object.keys(rest).forEach((e) =>
      rest[`${e}`] === "" ||
      rest[`${e}`] === "undefined" ||
      rest[`${e}`] === "null" ||
      rest[`${e}`] === null ||
      rest[`${e}`] === undefined
        ? notNullFiled.includes(e)
          ? delete rest[`${e}`]
          : (rest[`${e}`] = null)
        : null
    );
    if (req.files && req.files.item_image) {
      let file = req.files.item_image;
      let fileName = file.name.replace(/\s/g, "_");
      const fileExtRes = imageFilter(fileName);
      if (!fileExtRes) {
        return generalResponse(
          res,
          [],
          "Only image files are allowed like jpg,jpeg or png!",
          "error",
          true,
          200
        );
      }
      const current_date = new Date();
      let seconds = Math.round(current_date.getTime() / 1000);
      let filename = seconds + "_" + fileName;
      const folderCheck = folderExistCheck(`./public/item/`);
      if (folderCheck) {
        file.mv(`./public/item/${filename}`, async (err) => {
          if (err) {
            throw new Error("file not move in folder");
          } else {
            rest.item_image = `/item/${filename}`;
            await updateItemRepo(rest, { id });
            return generalResponse(res, null, "Item updated successfully");
          }
        });
      }
    } else {
      await updateItemRepo(rest, { id });
      return generalResponse(res, null, "Item updated successfully");
    }
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

const deleteItem = async (req, res) => {
  try {
    await deleteItemRepo({ id: parseInt(req.params.id) });
    return generalResponse(
      res,
      null,
      "Item deleted successfully",
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

module.exports = {
  getAllItems,
  getItem,
  createItem,
  updateItem,
  deleteItem,
};
