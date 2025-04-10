const errorFilterValidator = (errors) => {
  const extractedErrors = [];
  errors
    .array({ onlyFirstError: true })
    .map((err) => extractedErrors.push(err.msg));
  const errorResponse = extractedErrors.join(", ");
  return errorResponse;
};
module.exports = errorFilterValidator;
