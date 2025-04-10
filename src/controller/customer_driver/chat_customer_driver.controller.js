const generalResponse = require("../../helper/general_response.helper");
const db = require("../../models/");

const Sequelize = require("sequelize");
const { createRoomHelper } = require("../../helper/chat.helper");
const { findRole } = require("../../repository/role.repository");
const {
  findCompanyUser,
  findAllCompanyUser,
} = require("../../repository/company_user.repository");
const { sequelize } = require("../../models");
const {
  getMessageRoomForChat,
} = require("../../repository/chat_message.repository");
const imageFilter = require("../../helper/image_filter.helper");
const folderExistCheck = require("../../helper/folder_exist_check.helper");
const {
  countUnreadMessageReadStatusForApp,
  countUnreadMessageReadStatus,
} = require("../../repository/message_read_statuses.repository");
const { getAllRoom } = require("../../repository/room.repository");
const { findUser } = require("../../repository/user.repository");
const Op = Sequelize.Op;

const getRoomMessagesForChat = async (req, res) => {
  try {
    const data = await getMessageRoomForChat({
      room_id: req.query.room_id,
      company_id: req.company_id,
    });
    if (data && data.length > 0) {
      const jsonData = JSON.parse(JSON.stringify(data));
      let resData = jsonData.map((e) => {
        e.room_id = e.room_id;
        delete e.room_id;
        // e.sender_info = e.user_messages_info;
        e.sender_info = {};
        e.sender_info.name = e.user_messages_info.name;
        e.sender_info.image_path = e.user_messages_info.image_path;
        e.sender_info.role = e.user_messages_info.company_users[0].role.name;
        delete e.user_messages_info;
        if (e.attachment) {
          e.attachment = process.env.API + e.attachment;
        }
        return e;
      });

      return generalResponse(res, resData, "", "success", false, 200);
    } else {
      return generalResponse(res, [], "", "success", false, 200);
    }
  } catch (e) {
    console.log(e);
    return generalResponse(
      res,
      [e],
      "Something went wrong!!",
      "error",
      false,
      200
    );
  }
};

const createRoomForChat = async (req, res) => {
  const user_id = req.body.user_id;
  const t = await sequelize.transaction();

  try {
    // const userData = await findUserWithTransaction({ user_id }, t);
    // if (!userData) {
    //   t.commit();
    //   return generalResponse(res, [], "user not exit", "success", true, 200);
    // }

    const getUserData = await findUser({
      where: { id: user_id },
    });
    if (!getUserData) {
      return generalResponse(res, [], "user not exit", "success", true, 200);
    }

    const role = await findRole({
      where: { company_id: req.company_id, name: "admin" },
    });

    let getAdminUser = await findAllCompanyUser({
      where: { role_id: role.id, company_id: req.company_id },
      attributes: ["user_id"],
      transaction: t,
    });
    getAdminUser = JSON.parse(JSON.stringify(getAdminUser));
    let userids = getAdminUser.map((e) => e.user_id);
    let room_user = [...userids, user_id];
    let where = {
      company_id: req.company_id,
      delivery_id: null,
    };
    const room_data = await createRoomHelper(
      {
        company_id: req.company_id,
        delivery_id: null,
        created_by: req.user.id,
        read_only: false,
      },
      room_user,
      where,
      [user_id],
      t,
      req.company_id
    );
    if (room_data) {
      t.commit();
      return generalResponse(
        res,
        room_data,
        "room created",
        "success",
        false,
        200
      );
    } else {
      throw new Error();
    }
  } catch (e) {
    console.log(e);
    t.rollback();
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

const uploadChatForChat = async (req, res) => {
  try {
    let files = req.files.file;
    const room = req.body.room;
    let fileName = files.name.replace(/\s/g, "_");
    const fileExtRes = imageFilter(fileName);
    if (fileExtRes === true) {
      let fileExt = fileName.slice(fileName.lastIndexOf("."));
      let name = fileName.slice(0, fileName.lastIndexOf("."));
      const current_date = new Date();
      let seconds = Math.round(current_date.getTime() / 1000);
      let filename =
        seconds + "_" + room + "_" + req.user.id + "_" + name + fileExt;
      const folderCheck = folderExistCheck(`./public/chat/`);
      if (folderCheck) {
        files.mv(`./public/chat/${filename}`, async (err) => {
          if (err) {
            throw new Error(err);
          }
        });
        return generalResponse(
          res,
          `/chat/${filename}`,
          "file uploaded successfully",
          "success",
          true,
          200
        );
      } else {
        throw new Error();
      }
    } else {
      return generalResponse(
        res,
        [],
        "Only image files are allowed like jpg,jpge or png!",
        "error",
        true,
        200
      );
    }
  } catch (e) {
    return generalResponse(
      res,
      [],
      "Something went wrong!!",
      e,
      "error",
      false,
      200
    );
  }
};

const unreadMessageCount = async (req, res) => {
  try {
    const room = req.params.room;
    const unread_message_data = await countUnreadMessageReadStatusForApp({
      receiver_id: req.user.id,
      room_id: room,
    });
    return generalResponse(res, unread_message_data, "", "success", false, 200);
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

// for get all rooms for customer-driver
const getAllRoomForChat = async (req, res) => {
  try {
    let company_user = await findCompanyUser({
      where: { user_id: req.user.id, company_id: req.company_id },
      include: [
        {
          model: db.role,
          as: "role",
          attributes: ["name"],
          paranoid: false,
        },
      ],
    });
    company_user = JSON.parse(JSON.stringify(company_user));

    let role = company_user.role.name;

    let where = {};
    where.company_id = req.company_id;
    if (role === "customer") {
      where.user_id = req.user.id;
    } else if (role === "driver") {
      where.driver_id = req.user.id;
    }

    const attributes = ["id", "delivery_id"];
    const relation = [
      {
        model: db.room_user,
        required: false,
        include: [
          {
            model: db.user,
            as: "user_info",
            required: false,
            attributes: ["name", "id", "image_path"],
            include: [
              {
                model: db.company_user,
                required: false,
                where: {
                  company_id: req.company_id,
                  status: "ACTIVE",
                },
                attributes: ["id"],
                include: [
                  {
                    model: db.role,
                    where: {
                      name: {
                        [Op.not]: "admin",
                      },
                    },
                    attributes: ["name"],
                    paranoid: false,
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        model: db.delivery,
        as: "room_delivery_chat",
        attributes: [
          "pickup_location",
          "status",
          "expected_delivery_time",
          "expected_drop_off_delivery_time",
        ],
        where: where,
        include: [
          {
            model: db.user,
            as: "customer",
            attributes: ["name", "image_path", "phone_number"],
            paranoid: false,
          },
          {
            model: db.user,
            as: "driver",
            attributes: ["name", "image_path", "phone_number"],
            paranoid: false,
          },
        ],
      },
      {
        model: db.chat_message,
        as: "chat_messages",
        attributes: ["createdAt", "message"],
        order: [["createdAt", "desc"]],
        limit: 1,
      },
    ];
    const data = await getAllRoom({ where: {}, attributes, include: relation });

    let jsonData = JSON.parse(JSON.stringify(data));

    jsonData = jsonData
      .slice()
      .sort((a, b) =>
        a.chat_messages.length > 0 && b.chat_messages.length > 0
          ? new Date(b.chat_messages[0].createdAt) -
            new Date(a.chat_messages[0].createdAt)
          : true
      );
    const unread_message_data = await countUnreadMessageReadStatus(req.user.id);
    let unread_message_data_json = {};
    unread_message_data.length > 0 &&
      unread_message_data.forEach((e) => {
        unread_message_data_json[parseInt(e.room_id)] = {
          count: e.count,
        };
      });
    let resData = jsonData.map((e) => {
      let data = {};
      data.room_id = e.id;
      if (e.room_users.length > 0) {
        for (let i in e.room_users) {
          if (e.room_users[i]?.user_info?.company_users?.length > 0) {
            data.name = e.room_users[i].user_info?.name;
            data.role =
              e.room_users[i].user_info?.company_users?.[0].role?.name;
            data.id = e.room_users[i].user_info?.id;
            if (e.room_users[i].user_info?.image_path)
              data.image_path =
                process.env.API + e.room_users[i].user_info?.image_path;
            else data.image_path = null;
          }
        }
      }
      if (e.chat_messages && e.chat_messages.length === 1) {
        data.createdAt = e.chat_messages[0].createdAt;
        data.message = e.chat_messages[0].message;
      }
      data.unread_count =
        unread_message_data_json[e.id] && unread_message_data_json[e.id].count
          ? unread_message_data_json[e.id].count
          : null;

      data.delivery_id = e.delivery_id;
      // data.unread_ids =
      //   unread_message_data_json[e.id] && unread_message_data_json[e.id].ids
      //     ? unread_message_data_json[e.id].ids
      //     : null;
      data.driver = e?.room_delivery_chat?.driver;
      data.customer = e?.room_delivery_chat?.customer;
      data.pickup_time = e?.room_delivery_chat?.expected_delivery_time;
      data.status = e?.room_delivery_chat?.status;
      data.dropOff_time =
        e?.room_delivery_chat?.expected_drop_off_delivery_time;
      return data;
    });
    const shortedArray = resData.sort(function (a, b) {
      if (b.createdAt === undefined && a.createdAt === undefined) {
        return 0;
      }
      if (new Date(a.createdAt) < new Date(b.createdAt)) {
        return 1;
      }
      if (new Date(a.createdAt) > new Date(b.createdAt)) {
        return -1;
      }
      if (b.createdAt) {
        return 1;
      }
      if (a.createdAt) {
        return -1;
      }
      return 0;
    });

    return generalResponse(res, shortedArray, "", "success", false, 200);
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
  getRoomMessagesForChat,
  createRoomForChat,
  uploadChatForChat,
  unreadMessageCount,
  getAllRoomForChat,
};
