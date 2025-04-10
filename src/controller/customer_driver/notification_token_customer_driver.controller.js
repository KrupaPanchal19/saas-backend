const generalResponse = require("../../helper/general_response.helper");
const {
  createNotificationToken,
  findNotificationToken,
  updateNotificationToken,
  deleteNotificationToken,
} = require("../../repository/notification_token.repository");

const setNotificationToken = async (req, res) => {
  try {
    const data = await findNotificationToken({
      where: {
        user_id: parseInt(req.user.id),
        uuid: req.body.uuid,
      },
      attributes: ["id"],
    });
    if (data) {
      await updateNotificationToken({ token: req.body.token }, { id: data.id });
    } else {
      const data = {
        user_id: parseInt(req.user.id),
        uuid: req.body.uuid,
        token: req.body.token,
      };
      await createNotificationToken(data);
    }
    return generalResponse(res, [], "data added", "success", false, 200);
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

const removeNotificationToken = async (req, res) => {
  try {
    if (req.body.uuid !== "" && req.body.uuid) {
      await deleteNotificationToken({ uuid: req.body.uuid });
      return generalResponse(res, [], "token removed", "success", false, 200);
    } else {
      return generalResponse(res, [], "uuid not found", "error", false, 200);
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

module.exports = { setNotificationToken, removeNotificationToken };
