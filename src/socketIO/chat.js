const { saveMessageForChat } = require("../repository/chat_message.repository");

const saveMessageHelperForChat = async (data) => {
  const update = Object.keys(data);
  const allowUpdate = ["sender_id", "message", "room_id", "attachment"];
  const invalidedOP = update.every((update) => allowUpdate.includes(update));
  if (!invalidedOP) {
    return false;
  }
  try {
    if (
      data.message &&
      data.message !== undefined &&
      data.message !== null &&
      /\S/.test(data.message) // string is not empty and not just whitespace
    ) {
      data.attachment = null;
      data.message = data.message.trim();
      const insertedId = await saveMessageForChat(data);
      return insertedId;
    } else if (
      data.attachment &&
      data.attachment !== undefined &&
      data.attachment !== null
    ) {
      data.message = null;
      const insertedId = await saveMessageForChat(data);
      return insertedId;
    } else {
      return false;
    }
  } catch (e) {
    console.log(e);
    return false;
  }
};

module.exports = { saveMessageHelperForChat };
