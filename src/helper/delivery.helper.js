const moment = require("moment");
const db = require("../models/");

const imageFilter = require("./image_filter.helper");
const folderExistCheck = require("./folder_exist_check.helper");

const {
  createDelivery,
  updateDelivery,
  deleteDelivery,
} = require("../repository/delivery.repository");
const {
  bulkCreateDeliveryItem,
  deleteDeliveryItem,
} = require("../repository/delivery_item.repository");

const { statusAddInHistoryTable } = require("./delivery_history.helper");
const { notificationHelper } = require("./notification_status.helper");

const addDeliveryHelper = async (
  deliveryData,
  itemData,
  file,
  res,
  req,
  notification = true
) => {
  const sequelize = db.sequelize;
  try {
    t = await sequelize.transaction();
    const deliveryInsertData = await createDelivery(deliveryData, t);
    const insertedid = deliveryInsertData.id;
    let itemInsertData = [];
    itemData.forEach((e) => {
      let insertArray = {};
      insertArray.item_id = parseInt(e.id);
      insertArray.item_quantity = parseInt(e.item_quantity);
      insertArray.description = e.description;
      insertArray.delivery_id = insertedid;
      if (file !== null) {
        if (file[`${e.key}`]) {
          insertArray.image = [];
          let itemsImage = [];
          if (file[`${e.key}`][0]) {
            itemsImage = file[`${e.key}`];
          } else {
            itemsImage.push(file[`${e.key}`]);
          }
          itemsImage.forEach((element) => {
            let fileName = element.name.replace(/\s/g, "_");
            const fileExtRes = imageFilter(fileName);
            if (fileExtRes === true) {
              let fileExt = fileName.slice(fileName.lastIndexOf("."));
              let name = fileName.slice(0, fileName.lastIndexOf("."));
              const current_date = new Date();
              let seconds = Math.round(current_date.getTime() / 1000);
              let filename =
                seconds + "_" + e.id + "_" + insertedid + "_" + name + fileExt;
              const folderCheck = folderExistCheck(`./public/deliveryItem/`);
              if (folderCheck) {
                element.mv(`./public/deliveryItem/${filename}`, async (err) => {
                  if (err) {
                    throw new Error(err);
                  }
                });
              }
              insertArray.image.push({
                image: `/deliveryItem/${filename}`,
              });
            } else {
              throw new Error(
                "Only image files are allowed like jpg,jpge or png!"
              );
            }
          });
        }
      } else {
        insertArray.image = null;
      }
      itemInsertData.push(insertArray);
    });
    await bulkCreateDeliveryItem(itemInsertData, t);
    const topic = "the_final_final";
    if (deliveryData.status === "DRAFT") {
      const msg = await statusAddInHistoryTable(
        "DRAFT",
        insertedid,
        req.user.id,
        t
      );
      if (msg === false) {
        throw new Error();
      }
    } else if (deliveryData.status === "ASSIGNED") {
      const msg1 = await statusAddInHistoryTable(
        "REQUESTED",
        insertedid,
        req.user.id,
        t
      );
      if (notification) {
        await notificationHelper(
          insertedid,
          "REQUESTED",
          topic,
          deliveryData.user_id
        );
      }
      const msg2 = await statusAddInHistoryTable(
        "ASSIGNED",
        insertedid,
        req.user.id,
        t,
        "",
        deliveryData.driver_id
      );
      if (notification) {
        await notificationHelper(
          insertedid,
          "ASSIGNED",
          topic,
          deliveryData.user_id,
          deliveryData.driver_id
        );
      }
      if (msg1 === false || msg2 === false) {
        throw new Error();
      }
    } else {
      const msg = await statusAddInHistoryTable(
        "REQUESTED",
        insertedid,
        req.user.id,
        t
      );
      if (notification) {
        await notificationHelper(
          insertedid,
          "REQUESTED",
          topic,
          deliveryData.user_id
        );
      }
      if (msg === false) {
        throw new Error();
      }
    }
    await t.commit();
    return insertedid;
  } catch (e) {
    await t.rollback();
    return false;
  }
};

const editDeliveryHelper = async (
  id,
  deliveryData,
  itemData,
  file,
  req,
  previous_driver
) => {
  const sequelize = db.sequelize;
  try {
    t = await sequelize.transaction();
    await updateDelivery(deliveryData, { id }, t);
    await deleteDeliveryItem({
      where: {
        delivery_id: id,
      },
      transaction: t,
    });
    let itemInsertData = [];
    itemData.forEach((e) => {
      let insertArray = {};
      insertArray.item_id = parseInt(e.id);
      insertArray.item_quantity = parseInt(e.item_quantity);
      insertArray.description = e.description;
      insertArray.delivery_id = id;
      insertArray.image = null;

      if (file && file[`${e.key}`]) {
        insertArray.image = [];
        let itemsImage = [];
        if (file[`${e.key}`][0]) {
          itemsImage = file[`${e.key}`];
        } else {
          itemsImage.push(file[`${e.key}`]);
        }
        itemsImage.forEach((element) => {
          let fileName = element.name.replace(/\s/g, "_");
          const fileExtRes = imageFilter(fileName);
          if (fileExtRes === true) {
            let fileExt = fileName.slice(fileName.lastIndexOf("."));
            let name = fileName.slice(0, fileName.lastIndexOf("."));
            const current_date = new Date();
            let seconds = Math.round(current_date.getTime() / 1000);
            let filename =
              seconds + "_" + e.id + "_" + id + "_" + name + fileExt;
            const folderCheck = folderExistCheck(`./public/deliveryItem/`);
            if (folderCheck) {
              element.mv(`./public/deliveryItem/${filename}`, async (err) => {
                if (err) {
                  throw new Error(err);
                }
              });
            }
            insertArray.image.push({
              image: `/deliveryItem/${filename}`,
            });
          } else {
            throw new Error(
              "Only image files are allowed like jpg,jpge or png!"
            );
          }
        });
      }
      if (e.imageAlreadyStoreData.length > 0) {
        insertArray.image = [];
        e.imageAlreadyStoreData.forEach((e) => {
          var imageName = e.preview.replace(process.env.API, "");
          insertArray.image.push({ image: imageName });
        });
      }
      if (!file && !e.imageAlreadyStoreData) {
        insertArray.image = null;
      }
      itemInsertData.push(insertArray);
    });
    await bulkCreateDeliveryItem(itemInsertData, t);
    const topic = "the_final_final";
    if (deliveryData.driver_id !== previous_driver) {
      if (deliveryData.status === "ASSIGNED") {
        await statusAddInHistoryTable(
          "ASSIGNED",
          id,
          req.user.id,
          t,
          req.user.name,
          deliveryData.driver_id,
          previous_driver
        );
        await notificationHelper(
          id,
          "ASSIGNED",
          topic,
          deliveryData.user_id,
          deliveryData.driver_id,
          previous_driver
        );
      } else if (deliveryData.status === "REQUESTED") {
        await statusAddInHistoryTable(
          "REQUESTED",
          id,
          req.user.id,
          t,
          req.user.name,
          deliveryData.driver_id,
          previous_driver
        );
        await notificationHelper(
          id,
          "REQUESTED",
          topic,
          deliveryData.user_id,
          deliveryData.driver_id,
          previous_driver
        );
      }
    }
    if (
      !moment(req.body.previous_expected_time).isSame(
        req.body.expected_delivery_time
      ) &&
      (deliveryData.status === "REQUESTED" ||
        deliveryData.status === "ASSIGNED")
    ) {
      await notificationHelper(
        id,
        "PICKUPTIMECHANGE",
        topic,
        deliveryData.user_id,
        deliveryData.driver_id
      );
    }
    await t.commit();
    return true;
  } catch (e) {
    console.log(e);
    await t.rollback();
    return false;
  }
};

const deleteDeliveryHelper = async (id, whereCondition) => {
  const sequelize = db.sequelize;
  try {
    t = await sequelize.transaction();
    await deleteDelivery(whereCondition, t);
    await deleteDeliveryItem({
      where: {
        delivery_id: id,
      },
      transaction: t,
    });
    await t.commit();
    return true;
  } catch (e) {
    await t.rollback();
    return false;
  }
};

module.exports = {
  addDeliveryHelper,
  editDeliveryHelper,
  deleteDeliveryHelper,
};
