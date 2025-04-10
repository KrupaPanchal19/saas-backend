const generalResponse = require("../../helper/general_response.helper");
const { createContactUs } = require("../../repository/contact_us.repository");

const getContactUs = (req, res) => {
  return generalResponse(
    res,
    {
      email: req.user.email,
      name: req.user.name,
      phone_number: req.user.phone_number,
    },
    ""
  );
};
const addContactUs = async (req, res) => {
  const update = Object.keys(req.body);
  const allowUpdate = ["name", "email", "phone_number", "message"];
  const invalidOP = update.every((update) => allowUpdate.includes(update));
  if (!invalidOP) {
    return generalResponse(res, [], "Invalid operation!!", "error", true, 200);
  }
  try {
    const data = {
      name: req.body.name,
      email: req.body.email,
      phone_number: req.body.phone_number,
      message: req.body.message,
      company_id: req.company_id,
    };
    await createContactUs(data);
    return generalResponse(res, [], "Message Submitted", "success", true, 200);
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

module.exports = { getContactUs, addContactUs };
