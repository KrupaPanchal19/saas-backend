const db = require("../../models/");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

const generalResponse = require("../../helper/general_response.helper");
const { createRoomHelper } = require("../../helper/chat.helper");
const imageFilter = require("../../helper/image_filter.helper");
const folderExistCheck = require("../../helper/folder_exist_check.helper");

const { findAllUser, findUser } = require("../../repository/user.repository");
const { findRole } = require("../../repository/role.repository");
const {
  getMessageRoomForChat,
} = require("../../repository/chat_message.repository");
const { getAllRoom, getRoom } = require("../../repository/room.repository");
const {
  countUnreadMessageReadStatus,
} = require("../../repository/message_read_statuses.repository");

const getAllUserForChat = async (req, res) => {
  try {
    const attributes = ["id", "name"];
    const relation = [
      {
        model: db.company_user,
        attributes: ["id_number"],
        where: {
          company_id: req.company_id,
          status: "ACTIVE",
        },
        required: true,
        include: [
          {
            model: db.role,
            attributes: ["name"],
            required: true,
            paranoid: false,
            where: {
              name: ["driver", "customer"],
            },
          },
        ],
      },
      {
        model: db.room_user,
        as: "user_info",
        required: false,
        paranoid: false,
        attributes: ["room_id"],
        include: [
          {
            model: db.room,
            required: true,
            paranoid: false,
            where: {
              delivery_id: null,
            },
          },
        ],
      },
    ];
    const data = await findAllUser({
      attributes,
      include: relation,
    });
    const jsonData = JSON.parse(JSON.stringify(data));
    let resData = jsonData.map((e) => {
      let data = {};
      data.name = e.name;
      data.role = e.role;
      data.id = e.id;
      data.room = null;
      if (e.user_info.length > 0) {
        data.room = e.user_info[0].room_id;
      }
      return data;
    });
    return generalResponse(res, resData, "", "success", false, 200);
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

const createRoomForChat = async (req, res) => {
  try {
    const sequelize = db.sequelize;
    const user_id = req.body.user_id;
    t = await sequelize.transaction();

    const getUserData = await findUser({
      where: { id: user_id },
      attributes: ["id", "name", "image_path"],
      include: [
        {
          model: db.company_user,
          where: {
            company_id: req.company_id,
            status: "ACTIVE",
          },
          required: true,
          include: [
            {
              model: db.role,
              attributes: ["name"],
              required: true,
            },
          ],
        },
      ],
      transaction: t,
    });
    let data;
    if (getUserData) {
      data = {
        name: getUserData.name,
        id: getUserData.id,
        role: getUserData.company_users[0].role.name,
        image_path: getUserData.image_path
          ? process.env.API + getUserData.image_path
          : null,
      };
    } else {
      t.commit();
      return generalResponse(res, [], "user not exit", "success", true, 200);
    }

    // const getAdminUser = await findRole({
    //   where: {
    //     company_id: req.company_id,
    //     name: "admin",
    //   },
    //   include: [
    //     {
    //       model: db.company_user,
    //       where: {
    //         company_id: req.company_id,
    //         status: "ACTIVE",
    //       },
    //       attributes: ["user_id"],
    //     },
    //   ],
    // });
    let room_user = [req.user.id, user_id];
    let where = {
      delivery_id: null,
    };
    const dataRoom = await createRoomHelper(
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
    if (dataRoom) {
      data.room_id = dataRoom;
      t.commit();
      return generalResponse(res, data, "room created", "success", false, 200);
    } else {
      throw new Error();
    }
  } catch (e) {
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

const getAllRoomForChat = async (req, res) => {
  try {
    const attributes = ["id", "delivery_id", "archive"];
    const relation = [
      {
        model: db.room_user,
        required: false,
        include: [
          {
            model: db.user,
            as: "user_info",
            attributes: ["name", "id", "image_path"],
            paranoid: false,
            include: [
              {
                model: db.company_user,
                attributes: ["id_number"],
                where: {
                  company_id: req.company_id,
                  status: "ACTIVE",
                },
                required: true,
                paranoid: false,
                include: [
                  {
                    model: db.role,
                    attributes: ["name"],
                    required: true,
                    paranoid: false,
                    where: {
                      name: {
                        [Op.not]: "admin",
                      },
                    },
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
        attributes: ["pickup_location", "status"],
        include: [
          {
            model: db.user,
            as: "customer",
            attributes: ["name"],
            include: [
              {
                model: db.company_user,
                attributes: ["id_number"],
                where: {
                  company_id: req.company_id,
                },
                required: true,
                paranoid: false,
                include: [
                  {
                    model: db.role,
                    attributes: ["name"],
                    required: true,
                    paranoid: false,
                  },
                ],
              },
            ],
            paranoid: false,
          },
          {
            model: db.user,
            as: "driver",
            attributes: ["name"],
            include: [
              {
                model: db.company_user,
                attributes: ["id_number"],
                where: {
                  company_id: req.company_id,
                },
                required: true,
                paranoid: false,
                include: [
                  {
                    model: db.role,
                    attributes: ["name"],
                    required: true,
                    paranoid: false,
                  },
                ],
              },
            ],
            paranoid: false,
          },
        ],
      },
      {
        model: db.chat_message,
        as: "chat_messages",
        attributes: ["createdAt"],
        order: [["createdAt", "desc"]],
        limit: 1,
      },
    ];
    const data = await getAllRoom({ attributes, include: relation });
    let jsonData = JSON.parse(JSON.stringify(data));
    jsonData = jsonData
      .slice()
      .sort((a, b) =>
        a.chat_messages.length > 0 && b.chat_messages.length > 0
          ? new Date(b.chat_messages[0].createdAt) -
            new Date(a.chat_messages[0].createdAt)
          : true
      );
    // const adminIds = jsonData.map(
    //   (e) => e.room_users.filter((e) => e.user_info === null)[0]?.user_id
    // );
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
      data.room = e.id;
      data.archive = e.archive;
      if (e.room_users.length > 0) {
        const userData = e.room_users.filter((e) => e.user_info)[0];
        data.name = userData?.user_info?.name;
        data.role = userData?.user_info?.company_users[0]?.role?.name;
        data.id = userData?.user_info?.id;
        if (userData?.user_info?.image_path)
          data.image_path = process.env.API + userData?.user_info?.image_path;
        else data.image_path = null;
      }
      if (e.chat_messages && e.chat_messages.length === 1) {
        data.createdAt = e.chat_messages[0].createdAt;
      }
      data.unread_count =
        unread_message_data_json[e.id] && unread_message_data_json[e.id].count
          ? unread_message_data_json[e.id].count
          : null;

      data.delivery_id = e.delivery_id;
      data.delivery_info = e.room_delivery_chat;
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

const getRoomMessagesForChat = async (req, res) => {
  try {
    const roomInfo = await getRoom({
      id: req.query.room_id,
      company_id: req.company_id,
    });
    if (roomInfo.id === undefined || roomInfo.id === null) {
      return generalResponse(
        res,
        null,
        "you are not able to read a room message",
        "error",
        true,
        200
      );
    }
    const data = await getMessageRoomForChat({
      room_id: req.query.room_id,
      company_id: req.company_id,
    });
    if (data && data.length > 0) {
      const jsonData = JSON.parse(JSON.stringify(data));
      let resData = jsonData.map((e) => {
        e.room_id = e.room_id;
        delete e.room_id;
        e.sender_info = e.user_messages_info;
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
          false,
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
    return generalResponse(res, [], e, "error", false, 200);
  }
};

module.exports = {
  getAllUserForChat,
  createRoomForChat,
  getAllRoomForChat,
  getRoomMessagesForChat,
  uploadChatForChat,
};
