require("dotenv").config();
const io = require("../../server");
const db = require("../models/");
const jwt = require("jsonwebtoken");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

const companyAuthentication = require("./company_authentication");

const { saveMessageHelperForChat } = require("./chat");
const { findUser } = require("../repository/user.repository");
const { getAllRoom, updateRoom } = require("../repository/room.repository");
const {
  findAllRoomUser,
  createRoomUser,
} = require("../repository/room_user.repository");
const {
  createMessageReadStatus,
  deleteUserUnreadMessageReadForUser,
} = require("../repository/message_read_statuses.repository");

const {
  notificationChatHelper,
} = require("../helper/notification_chat.helper");
const { setLivePoint } = require("./live_point");

io.use(function (socket, next) {
  if (socket.handshake.query && socket.handshake.query.token) {
    jwt.verify(
      socket.handshake.query.token,
      process.env.SECRET_KEY,
      function (err, decoded) {
        if (err) return next(new Error("Authentication error"));
        decoded["company_id"] = parseInt(
          socket.handshake.query["x-tff-company-id"]
        );
        socket.decoded = decoded;
        next();
      }
    );
  } else {
    next(new Error("Authentication error"));
  }
})
  .use(companyAuthentication)
  .on("connection", async (socket) => {
    if (
      socket.decoded.company_user_info.role.name === "admin" ||
      socket.decoded.company_user_info.role.name === "staff"
    ) {
      socket.join(`${socket.decoded["company_id"]}-admin-channel`);
    } else if (socket.decoded.company_user_info.role.name === "customer") {
      socket.join(
        `${socket.decoded["company_id"]}-customer-${socket.decoded.userId}`
      );
    } else if (socket.decoded.company_user_info.role.name === "driver") {
      socket.join(
        `${socket.decoded["company_id"]}-driver-${socket.decoded.userId}`
      );
    }

    socket.on("setLivePoint", async (data) => {
      data.id = socket.decoded.userId;

      const res = await setLivePoint(data);
      if (res !== false) {
        const broadcastData = {
          delivery_id: data.delivery_id,
          coordinates: [parseFloat(data.latitude), parseFloat(data.longitude)],
        };
        socket.broadcast
          .to(`${socket.decoded["company_id"]}-admin-channel`)
          .to(`${socket.decoded["company_id"]}-customer-${res}`)
          .emit("live_point", broadcastData);
      }
    });

    socket.on("joinChatRoom", async (data) => {
      socket.join(`${socket.decoded["company_id"]}-chat-${data}`);
    });

    socket.on("sendChatMessagesInRoom", async (data) => {
      data.sender_id = socket.decoded.userId;
      const res = await saveMessageHelperForChat(data);

      const roomUser = await findAllRoomUser({
        where: { room_id: data.room_id },
        attributes: ["user_id"],
      });

      const where = { id: data.room_id };
      const attributes = ["delivery_id", "read_only", "id"];
      const relation = [
        {
          model: db.delivery,
          required: false,
          as: "room_delivery_chat",
          attributes: [
            "pickup_location",
            "status",
            "expected_delivery_time",
            "expected_drop_off_delivery_time",
          ],
          include: [
            {
              model: db.user,
              as: "customer",
              attributes: ["name", "image_path"],
              paranoid: false,
            },
            {
              model: db.user,
              as: "driver",
              attributes: ["name", "image_path"],
              paranoid: false,
            },
          ],
        },
      ];

      const roomInfo = await getAllRoom({
        where,
        attributes,
        include: relation,
      });
      let chat_info = JSON.parse(JSON.stringify(roomInfo)).map((e) => {
        let data = {};
        data.room_id = e.id;
        data.delivery_id = e.delivery_id;
        data.driver = e?.room_delivery_chat?.driver;
        data.customer = e?.room_delivery_chat?.customer;
        data.pickup_time = e?.room_delivery_chat?.expected_delivery_time;
        data.dropOff_time =
          e?.room_delivery_chat?.expected_drop_off_delivery_time;
        return data;
      });
      const resData = {
        type: chat_info[0].delivery_id ? "delivery" : "admin",
        chat_info: chat_info.length > 0 ? chat_info[0] : null,
      };
      const removeParticularUser = roomUser.reduce(
        (removeParticularUser, e) => (
          e.user_id !== socket.decoded.userId &&
            removeParticularUser.push(e.user_id),
          removeParticularUser
        ),
        []
      );
      if (
        roomUser.filter((e) => e.user_id === socket.decoded.userId).length === 0
      ) {
        await createRoomUser([
          {
            company_id: socket.decoded.company_id,
            user_id: socket.decoded.userId,
            room_id: data.room_id,
          },
        ]);
      }
      const messageUnreadInsertData = removeParticularUser.map((e) => {
        return { receiver_id: e, message_id: res.id, room_id: data.room_id };
      });
      await createMessageReadStatus(messageUnreadInsertData);
      const messageNotification = data.message
        ? data.message
        : "file is receive.";
      await notificationChatHelper(
        removeParticularUser,
        messageNotification,
        "The Final Final",
        resData
      );
      const messageData = {
        createdAt: new Date(),
        message: data.message ? data.message : null,
        room_id: data.room_id,
        attachment: data.attachment ? process.env.API + data.attachment : null,
        sender_id: socket.decoded.userId,
        sender_info: {
          image_path:
            socket.decoded["company_user_info"] &&
            socket.decoded["company_user_info"].user.image_path
              ? socket.decoded["company_user_info"].user.image_path
              : null,
          name: socket.decoded["company_user_info"].user.name,
          role: socket.decoded["company_user_info"].role.name,
        },
      };
      if (res !== false) {
        socket.broadcast
          .to(`${socket.decoded["company_id"]}-admin-channel`)
          .emit("getChatMessageForRoomForAdmin", messageData);
        socket.broadcast
          .to(`${socket.decoded["company_id"]}-chat-${data.room_id}`)
          .emit("getChatMessageForRoom", messageData);
        io.to(socket.id).emit("getChatMessageForRoom", messageData);
      }
    });

    socket.on("readChatMessage", async (room_id) => {
      await deleteUserUnreadMessageReadForUser(socket.decoded.userId, room_id);
    });

    socket.on("sendArchiveEvent", async (data) => {
      await updateRoom({ archive: data.archive }, { id: data.roomNumber });
    });

    socket.on("disconnect", () => {
      if (socket.decoded.company_user_info.role.name === "customer") {
        socket.leave(
          `${socket.decoded["company_id"]}-customer-${socket.decoded.userId}`
        );
      } else if (socket.decoded.company_user_info.role.name === "driver") {
        socket.leave(
          `${socket.decoded["company_id"]}-driver-${socket.decoded.userId}`
        );
      } else if (
        socket.decoded.company_user_info.role.name === "admin" ||
        socket.decoded.company_user_info.role.name === "staff"
      ) {
        socket.leave(`${socket.decoded["company_id"]}-admin-channel`);
      }
    });
  });
