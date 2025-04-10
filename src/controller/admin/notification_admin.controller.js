require("dotenv").config();
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const db = require("../../models/");

const generalResponse = require("../../helper/general_response.helper");

const {
  findAndCountAllNotification,
  findNotification,
  createNotification,
  deleteNotification: deleteNotificationRepo,
} = require("../../repository/notification.repository");
const { findAllUser } = require("../../repository/user.repository");
const { findCompany } = require("../../repository/company.repository");

const { notificationMessage } = require("../../helper/notification.helper");
// const { companyName } = require("../../email_template/text_select");
const sendMailHelper = require("../../helper/sendmail.helper");

const addNotification = async (req, res) => {
  try {
    let extraTextData = `<div>
    <span> <b> ${req.body.title}</b></span><br/>
    <span> ${req.body.message}</span><br/>
    </div>`;

    const where = { id: [...req.body.customer, ...req.body.driver] };
    const attributes = ["id", "email", "name"];
    const include = [
      {
        model: db.notification_token,
        required: true,
        attributes: ["uuid", "token"],
      },
    ];
    const driverData = await findAllUser({ where, attributes, include });
    if (driverData.length > 0) {
      const companyData = await findCompany({
        where: { id: req.company_id },
        attributes: ["name"],
      });
      driverData.forEach(async (e) => {
        const tokens = e.notification_tokens.map((e) => e.token);
        if (tokens.length > 0) {
          await notificationMessage(
            tokens,
            req.body.message,
            req.body.title,
            companyData.name
          );
        }
        await sendMailHelper(
          e.name,
          e.email,
          "Admin Notification",
          extraTextData,
          req.company
        );
      });

      await createNotification({
        company_id: req.company_id,
        title: req.body.title,
        message: req.body.message,
        customer: req.body.customer,
        driver: req.body.driver,
      });
      return generalResponse(
        res,
        [],
        "Notification Added",
        "success",
        true,
        200
      );
    } else {
      return generalResponse(res, [], "No user available", "error", true, 200);
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

const getNotifications = async (req, res) => {
  try {
    let limit = 10;
    let offset = (req.query.page - 1) * 10;
    const filterData = req.query.filterData;
    let where = { company_id: req.company_id };
    if (filterData) {
      where = {
        ...where,
        [Op.or]: [
          { title: { [Op.like]: "%" + filterData + "%" } },
          { message: { [Op.like]: "%" + filterData + "%" } },
          { createdAt: { [Op.like]: "%" + filterData + "%" } },
        ],
      };
    }
    let attributes = [
      "id",
      "title",
      "message",
      "createdAt",
      "customer",
      "driver",
    ];

    const data = await findAndCountAllNotification({
      where,
      limit,
      offset,
      attributes,
      order: [["createdAt", "DESC"]],
      $sort: { id: 1 },
    });
    if (data && data.rows && data.rows.length > 0) {
      const attributes = ["name"];
      const resData = await Promise.all(
        data.rows.map(async (e) => {
          let customerName = "";
          let driverName = "";

          if (e.customer) {
            const where = { id: e.customer };
            const customerData = await findAllUser({ where, attributes });
            customerData.forEach((e1) => {
              customerName += e1.name + ",";
            });
          }
          if (e.driver) {
            const where = { id: e.driver };
            const driverData = await findAllUser({ where, attributes });
            driverData.forEach((e1) => {
              driverName += e1.name + ",";
            });
          }
          return {
            id: e.id,
            title: e.title,
            message: e.message,
            createdAt: e.createdAt,
            customer: e.customer ? customerName.slice(0, -1) : null,
            driver: e.driver ? driverName.slice(0, -1) : null,
          };
        })
      );
      return generalResponse(res, { count: data.count, rows: resData });
    } else {
      return generalResponse(res, [], "No data found!!", "success", false, 200);
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

const deleteNotification = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await deleteNotificationRepo({ id, company_id: req.company_id });
    return generalResponse(
      res,
      [],
      "Notification deleted successfully",
      "success",
      true,
      200
    );
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

const resendMail = async (req, res) => {
  try {
    const notificationData = await findNotification({ id: req.params.id }, [
      "title",
      "message",
      "customer",
      "driver",
    ]);
    if (notificationData) {
      const where = {
        id: [...notificationData.customer, ...notificationData.driver],
      };
      const attributes = ["role", "id", "email", "name"];
      const relation = [
        {
          model: db.notification_token,
          required: true,
          attributes: ["uuid", "token"],
        },
      ];

      const driverData = await getUsersWithRelation(
        where,
        attributes,
        relation
      );
      let extraTextData = `<div>
    <span> <b> ${notificationData.title}</b></span><br/>
    <span> ${notificationData.message}</span><br/>
    </div>`;
      if (driverData.length > 0) {
        driverData.forEach(async (e) => {
          const tokens = e.notification_tokens.map((e) => e.token);
          if (tokens.length > 0) {
            await notificationMessage(
              tokens,
              notificationData.message,
              notificationData.title,
              companyName[global.connectionName]
            );
          }
          await sendMailHelper(
            e.name,
            e.email,
            "Admin Notification",
            extraTextData,
            req.company
          );
        });
        return generalResponse(
          res,
          [],
          "Notification Resend",
          "success",
          true,
          200
        );
      } else {
        return generalResponse(
          res,
          [],
          "Something went wrong!!",
          "error",
          true,
          200
        );
      }
    } else {
      throw new Error();
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
  addNotification,
  getNotifications,
  deleteNotification,
  resendMail,
};
