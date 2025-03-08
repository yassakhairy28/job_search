const globalErrorHandler = (error, req, res, next) => {
  const statusCode = error.cause || 500;
  return res
    .status(statusCode)
    .json({ success: false, message: error.message });
};

export default globalErrorHandler;
