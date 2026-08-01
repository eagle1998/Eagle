const ApiError = require('../utils/ApiError');
const { ZodError } = require('zod');

const notFound = (req, res, next) => {
  next(new ApiError(404, `Not Found - ${req.originalUrl}`));
};

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let status = err.status || 'error';
  let message = err.message;
  let errors = undefined;

  const isDev = process.env.NODE_ENV === 'development';
  const isOperational = err.isOperational !== false;

  if (err instanceof ZodError) {
    statusCode = 400;
    status = 'fail';
    message = 'Validation failed';
    errors = err.errors.map(e => ({
      field: e.path.join('.'),
      message: e.message
    }));
  }

  if (!isDev && !isOperational && !(err instanceof ZodError)) {
    message = 'Something went wrong';
  }

  if (isDev) {
    console.error(err);
  }

  const response = {
    success: false,
    status,
    message
  };

  if (errors) {
    response.errors = errors;
  }

  if (isDev) {
    response.stack = err.stack;
    response.error = err;
  }

  res.status(statusCode).json(response);
};

module.exports = { notFound, errorHandler };
