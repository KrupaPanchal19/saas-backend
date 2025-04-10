const db = require("../../models/");

const generalResponse = require("../../helper/general_response.helper");
const imageFilter = require("../../helper/image_filter.helper");
const folderExistCheck = require("../../helper/folder_exist_check.helper");

const {
  updateDeliveryCompletedNotes,
  createDeliveryCompletedNotes,
} = require("../../repository/delivery_completed_notes.repository");
const {
  statusAddInHistoryTable,
} = require("../../helper/delivery_history.helper");
const {
  notificationHelper,
} = require("../../helper/notification_status.helper");
const sendMailHelper = require("../../helper/sendmail.helper");
const { paymentChargeHelper } = require("../../helper/payment_charge.helper");
const { DeliveryInfoMail } = require("../../helper/delivery_info_mail.helper");
const {
  findDelivery,
  updateDelivery,
} = require("../../repository/delivery.repository");
const {
  findDeliveryCompletedNotes,
} = require("../../repository/delivery_completed_notes.repository");
const { findUser } = require("../../repository/user.repository");
const { parse } = require("handlebars");

const delivery_completed_notes = async (req, res) => {
  const sequelize = db.sequelize;
  t = await sequelize.transaction();
  try {
    const { delivery_id, comment, status } = req.body;
    const file = req.files;
    let image = [];

    const delivery_status = await findDelivery({
      where: { id: delivery_id },
      attributes: ["status", "driver_id", "user_id", "payment_type"],
      transaction: t,
    });
    if (
      delivery_status.status != "PICKEDUP" ||
      delivery_status.driver_id != req.user.id
    ) {
      throw new Error("you can't completed this delivery");
    }
    if (file !== null) {
      let images = [];
      if (file["images"][0]) {
        images = file["images"];
      } else {
        images.push(file["images"]);
      }
      images.forEach((element) => {
        let fileName = element.name.replace(/\s/g, "_");
        const fileExtRes = imageFilter(fileName);
        if (fileExtRes === true) {
          const current_date = new Date();
          let seconds = Math.round(current_date.getTime() / 1000);
          let filename = seconds + "_" + req.body.delivery_id + "_" + fileName;
          const folderCheck = folderExistCheck(
            `./public/deliveryCompletedNotes/`
          );
          if (folderCheck) {
            element.mv(
              `./public/deliveryCompletedNotes/${filename}`,
              async (err) => {
                if (err) {
                  throw new Error(err);
                }
              }
            );
          }
          image.push({
            image: `/deliveryCompletedNotes/${filename}`,
          });
        } else {
          throw new Error("Only image files are allowed like jpg,jpge or png!");
        }
      });
    } else {
      image = null;
    }
    const findData = await findDeliveryCompletedNotes({
      where: { delivery_id: parseInt(delivery_id) },
      transaction: t,
    });

    await updateDelivery({ status: status }, { id: delivery_id }, t);
    await statusAddInHistoryTable(
      status,
      delivery_id,
      req.user.id,
      t,
      req.user.name
    );
    let data = null;
    if (findData) {
      data = await updateDeliveryCompletedNotes(
        {
          delivery_id: parseInt(delivery_id),
          comment: comment ? comment : null,
          images: image,
        },
        { delivery_id: parseInt(delivery_id) },
        t
      );
    } else {
      data = await createDeliveryCompletedNotes(
        {
          delivery_id: parseInt(delivery_id),
          comment,
          images: image,
        },
        t
      );
    }
    const userInfo = await findUser({
      where: { id: parseInt(delivery_status.user_id) },
      attributes: ["email", "name"],
    });

    let msg = "";
    if (delivery_status.payment_type === "online") {
      const resDataOfPayment = await paymentChargeHelper(
        parseInt(delivery_id),
        req.company.stripe_account_id
      );
      if (resDataOfPayment === true) {
        console.log(resDataOfPayment);
      } else if (resDataOfPayment.mail) {
        if (resDataOfPayment.mail === "success") {
          const extraText = await DeliveryInfoMail(delivery_id);
          await sendMailHelper(
            userInfo.name,
            userInfo.email,
            "Payment Confirmation",
            extraText,
            req.company
          );
          msg = "Delivery payment is successfully completed";
        } else if (resDataOfPayment.mail === "failed") {
          await sendMailHelper(
            userInfo.name,
            userInfo.email,
            "Payment failed",
            null,
            req.company
          );
          msg = "Delivery payment is failed. inform customer";
        }
      }
    }
    // else {
    //   console.log("in error", resDataOfPayment);
    //   throw new Error(resDataOfPayment);
    // }
    await t.commit();

    await notificationHelper(
      delivery_id,
      "COMPLETED",
      "the final final",
      delivery_status.user_id
    );
    const extraText = await DeliveryInfoMail(delivery_id);
    await sendMailHelper(
      userInfo.name,
      userInfo.email,
      "Your Delivery has been Completed!",
      extraText,
      req.company
    );
    if (data) {
      return generalResponse(
        res,
        [],
        "Driver completed note added successfully. " + msg,
        "success",
        false,
        200
      );
    }
  } catch (e) {
    console.log(e);
    await t.rollback();
    if (typeof e.message === "string") {
      return generalResponse(res, [], e.message, "error", false, 200);
    } else {
      return generalResponse(
        res,
        [],
        "Something went wrong!!",
        "error",
        false,
        200
      );
    }
  }
};
module.exports = { delivery_completed_notes };
