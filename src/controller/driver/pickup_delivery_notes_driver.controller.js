const db = require("../../models/");

const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const generalResponse = require("../../helper/general_response.helper");
const {
  addDeliveryNotes,
  updateDeliveryNotes,
  getDeliveryNotes,
} = require("../../repository/delivery_pickup_notes.repository");
const {
  statusAddInHistoryTable,
} = require("../../helper/delivery_history.helper");
const {
  notificationHelper,
} = require("../../helper/notification_status.helper");
const { findUser } = require("../../repository/user.repository");
const sendMailHelper = require("../../helper/sendmail.helper");

const { retrievePaymentIntent } = require("../../stripe/retrievePaymentIntent");

const { createRoomHelper } = require("../../helper/chat.helper");
const { DeliveryInfoMail } = require("../../helper/delivery_info_mail.helper");
const imageFilter = require("../../helper/image_filter.helper");
const folderExistCheck = require("../../helper/folder_exist_check.helper");
const {
  getDeliveryWithRelationWithTransaction,
  updateDelivery,
} = require("../../repository/delivery.repository");
const { findCompany } = require("../../repository/company.repository");

const pickup_delivery_notes = async (req, res) => {
  const sequelize = db.sequelize;
  t = await sequelize.transaction();
  try {
    const { delivery_id, pickup_status, comment, status } = req.body;
    const file = req.files;
    let image = [];
    const relation = [
      {
        model: db.delivery_payment_log,
        as: "delivery_payment_log",
        required: false,
        attributes: [
          "payment_status",
          "transaction_id",
          "delivery_id",
          "type",
          "id",
          "amount",
        ],
        where: {
          payment_status: { [Op.in]: ["pending", "success"] },
          delivery_id: delivery_id,
        },
      },
    ];
    const delivery_status = await getDeliveryWithRelationWithTransaction(
      delivery_id,
      ["status", "driver_id", "user_id", "payment_type"],
      relation,
      t
    );
    if (
      delivery_status.status !== "ASSIGNED" ||
      delivery_status.driver_id !== req.user.id
    ) {
      throw new Error("you can't pick-up this delivery");
    }
    if (
      delivery_status.delivery_payment_log.length < 1 &&
      delivery_status.payment_type === "online"
    ) {
      throw new Error(
        "Payment of an delivery is still pending, So you are not able to pick-up the items."
      );
    }
    if (
      delivery_status.delivery_payment_log.length === 1 &&
      delivery_status.delivery_payment_log[0].payment_status === "pending" &&
      delivery_status.payment_type === "online"
    ) {
      const paymentData = await retrievePaymentIntent(
        delivery_status.delivery_payment_log[0].transaction_id,
        req.company.stripe_account_id
      );
      if (
        paymentData.status !== "requires_capture"
        //|| paymentData.status !== "succeeded"
      ) {
        throw new Error(
          "Payment of an delivery is still pending, So you are not able to pick-up the items."
        );
      }
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
          const folderCheck = folderExistCheck(`./public/deliveryNotes/`);
          if (folderCheck) {
            element.mv(`./public/deliveryNotes/${filename}`, async (err) => {
              if (err) {
                throw new Error(err);
              }
            });
          }
          image.push({
            image: `/deliveryNotes/${filename}`,
          });
        } else {
          throw new Error("Only image files are allowed like jpg,jpge or png!");
        }
      });
    } else {
      image = null;
    }

    const findData = await getDeliveryNotes(parseInt(delivery_id), t);
    let room_user = [delivery_status.user_id, delivery_status.driver_id];
    let where = {
      delivery_id: parseInt(delivery_id),
    };
    const room_data = await createRoomHelper(
      {
        delivery_id: parseInt(delivery_id),
        created_by: req.user.id,
        read_only: false,
        company_id: req.company_id,
      },
      room_user,
      where,
      [delivery_status.user_id, delivery_status.driver_id],
      t,
      req.company_id
    );
    if (room_data) {
      await updateDelivery(
        { status, room_id: room_data },
        { id: delivery_id },
        t
      );
      await statusAddInHistoryTable(
        status,
        delivery_id,
        req.user.id,
        t,
        req.user.name
      );

      let data = null;
      if (findData) {
        data = await updateDeliveryNotes(
          {
            delivery_id: parseInt(delivery_id),
            pickup_status,
            comment: comment ? comment : null,
            images: image,
          },
          parseInt(delivery_id),
          t
        );
      } else {
        data = await addDeliveryNotes(
          {
            delivery_id: parseInt(delivery_id),
            pickup_status,
            comment,
            images: image,
          },
          t
        );
      }
      await t.commit();
      await notificationHelper(
        delivery_id,
        "PICKEDUP",
        "the final final",
        delivery_status.user_id
      );
      const userInfo = await findUser({
        where: { id: delivery_status.user_id },
        attributes: ["email", "name"],
      });
      const extraText = await DeliveryInfoMail(delivery_id);
      await sendMailHelper(
        userInfo.name,
        userInfo.email,
        "Your Delivery has been Picked Up",
        extraText,
        req.company
      );
      if (data) {
        return generalResponse(
          res,
          { room_id: room_data },
          "driver note added successfully",
          "success",
          false,
          200
        );
      }
    } else {
      throw new Error("no room created");
    }
  } catch (e) {
    console.log(e);
    await t.rollback();
    if (typeof e.message === "string") {
      return generalResponse(res, [], e.message, "error", true, 200);
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

module.exports = { pickup_delivery_notes };
