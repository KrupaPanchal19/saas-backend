const express = require("express");
const chat_admin = express.Router();

//middleware
const userAuth = require("../../middleware/passport/user_auth");
const companyAdminStaffAuth = require("../../middleware/company_auth/admin_staff_auth");

//controller
const {
  getAllUserForChat,
  createRoomForChat,
  getAllRoomForChat,
  getRoomMessagesForChat,
  uploadChatForChat,
} = require("../../controller/admin/chat_admin.controller");

chat_admin.get(
  "/admin/get_all_user",
  userAuth,
  companyAdminStaffAuth,
  getAllUserForChat
);

chat_admin.post(
  "/admin/create_room_chat",
  userAuth,
  companyAdminStaffAuth,
  createRoomForChat
);

chat_admin.get(
  "/admin/get_all_room",
  userAuth,
  companyAdminStaffAuth,
  getAllRoomForChat
);
chat_admin.get(
  "/admin/get_chat_messages",
  userAuth,
  companyAdminStaffAuth,
  getRoomMessagesForChat
);

chat_admin.post(
  "/admin/upload_chat_file",
  userAuth,
  companyAdminStaffAuth,
  uploadChatForChat
);

module.exports = chat_admin;
