const generalResponse = (
  response,
  data = null,
  message = "",
  response_type = "success",
  toast = false,
  statusCode = 200
) => {
  response.status(statusCode).send({
    data: data,
    message: message,
    toast: toast,
    response_type: response_type,
  });
};
module.exports = generalResponse;
