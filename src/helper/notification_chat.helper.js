const {
  findAllNotificationToken,
} = require("../repository/notification_token.repository");
const { notificationMessage } = require("./notification.helper");

const notificationChatHelper = async (
  user,
  message,
  topic,
  extraInfo = null
) => {
  let userToken = [];
  const userTokenData = await findAllNotificationToken({
    where: { user_id: user },
    attributes: ["token", "user_id"],
  });

  if (userTokenData) {
    await JSON.parse(JSON.stringify(userTokenData)).forEach((e) => {
      userToken.push(e.token);
    });
  }
  if (userToken.length > 0) {
    await notificationMessage(userToken, message, "Message", topic, extraInfo);
  }
};
module.exports = { notificationChatHelper };
