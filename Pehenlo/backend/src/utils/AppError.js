class AppError extends Error {
  constructor(message, statusCode = 500, code = 'SERVER_ERROR', errors = null, data = null) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.errors = errors;
    this.data = data;
    this.isOperational = true;
  }
}

module.exports = AppError;
