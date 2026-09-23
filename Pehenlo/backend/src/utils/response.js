const successResponse = (res, data = null, message = 'Success', statusCode = 200) => {
  const payload = { success: true, message };
  if (data !== null && data !== undefined) {
    payload.data = data;
  }
  return res.status(statusCode).json(payload);
};

const errorResponse = (res, message = 'Something went wrong', statusCode = 500) => {
  return res.status(statusCode).json({ success: false, message });
};

module.exports = { successResponse, errorResponse };
