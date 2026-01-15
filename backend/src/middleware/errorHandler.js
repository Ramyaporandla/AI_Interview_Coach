/**
 * Global error handling middleware
 */
export const errorHandler = (err, req, res, next) => {
  console.error('[ErrorHandler] Error:', err);
  console.error('[ErrorHandler] Error details:', {
    name: err.name,
    message: err.message,
    code: err.code,
    status: err.status || err.statusCode
  });

  // Default error
  let status = err.status || err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Handle multer errors (file upload)
  if (err.code === 'LIMIT_FILE_SIZE') {
    status = 413;
    message = 'File too large. Maximum size is 5MB.';
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    status = 400;
    message = 'Unexpected file field. Please use "resume" as the field name.';
  }

  if (err.message && err.message.includes('Invalid file type')) {
    status = 400;
    message = err.message;
  }

  // Handle specific error types
  if (err.name === 'ValidationError') {
    status = 400;
    message = 'Validation Error: ' + message;
  }

  if (err.name === 'UnauthorizedError') {
    status = 401;
    message = 'Unauthorized';
  }

  if (err.code === '23505') { // PostgreSQL unique violation
    status = 409;
    message = 'Resource already exists';
  }

  // Handle database connection errors
  if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
    status = 503;
    message = 'Database connection error. Please try again later.';
  }

  // Don't leak error details in production
  if (process.env.NODE_ENV === 'production' && status === 500) {
    message = 'Internal Server Error';
  }

  res.status(status).json({
    error: message,
    message: message, // Include both for consistency
    ...(process.env.NODE_ENV !== 'production' && { 
      stack: err.stack,
      details: err.message 
    })
  });
};

