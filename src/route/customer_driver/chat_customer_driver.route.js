const express = require("express");
const userAuth = require("../../middleware/passport/user_auth");
const companyCustomerDriverAuth = require("../../middleware/company_auth/customer_driver_auth");
const {
  createRoomForChat,
  getRoomMessagesForChat,
  uploadChatForChat,
  unreadMessageCount,
  getAllRoomForChat,
} = require("../../controller/customer_driver/chat_customer_driver.controller");

const chat_customer_driver = express.Router();

chat_customer_driver.post(
  "/create_room_chat",
  userAuth,
  companyCustomerDriverAuth,
  createRoomForChat
);

chat_customer_driver.get(
  "/get_chat_messages",
  userAuth,
  companyCustomerDriverAuth,
  getRoomMessagesForChat
);

chat_customer_driver.post(
  "/upload_chat_file",
  userAuth,
  companyCustomerDriverAuth,
  uploadChatForChat
);

chat_customer_driver.get(
  "/unread_message_count/:room",
  userAuth,
  companyCustomerDriverAuth,
  unreadMessageCount
);

chat_customer_driver.get(
  "/get_all_rooms",
  userAuth,
  companyCustomerDriverAuth,
  getAllRoomForChat
);

module.exports = chat_customer_driver;
