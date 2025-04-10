const { getRoom, createRoom } = require("../repository/room.repository");
const { createRoomUser } = require("../repository/room_user.repository");
const db = require("../models/");

const createRoomHelper = async (
  data,
  room_user,
  where,
  user_id,
  t,
  company_id
) => {
  try {
    const checkRoomExitOrNot = await getRoom({
      where,
      attributes: ["id"],
      include: [
        {
          model: db.room_user,
          required: true,
          where: { user_id: [...user_id] },
        },
      ],
      transaction: t,
    });
    if (checkRoomExitOrNot) {
      return checkRoomExitOrNot.id;
    }

    const room_inserted_data = await createRoom(data, t);
    let room_user_data = [];
    room_user.forEach((element) => {
      room_user_data.push({
        company_id: parseInt(company_id),
        room_id: room_inserted_data.id,
        user_id: element,
      });
    });
    await createRoomUser(room_user_data, t);
    return room_inserted_data.id;
  } catch (e) {
    console.log(e);
    return false;
  }
};

module.exports = { createRoomHelper };
