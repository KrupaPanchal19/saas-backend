const adminFirebase = require("firebase-admin");

const notificationMessage = async (tokens, msg, title, topic, extraInfo) => {
  const message = {
    notification: {
      title: title,
      body: msg,
    },
    data: { extraData: extraInfo ? JSON.stringify(extraInfo) : "" },
    tokens: tokens,
    topic: topic,
  };
  adminFirebase.apps[0]
    .messaging()
    .sendMulticast(message)
    .then((response) => {
      console.log(response.successCount + " messages were sent successfully");
    });
};

module.exports = { notificationMessage };
