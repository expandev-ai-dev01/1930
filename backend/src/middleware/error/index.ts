/**
 * @summary
 * Global error handling middleware for Express application.
 * Catches and formats all errors with appropriate HTTP status codes.
 *
 * @module middleware/error
 */

import { Request, Response, NextFunction } from 'express';

/**
 * @interface ErrorResponse
 * @description Standard error response structure
 *
 * @property {boolean} success - Always false for errors
 * @property {object} error - Error details object
 * @property {string} error.code - Error code identifier
 * @property {string} error.message - Human-readable error message
 * @property {any} error.details - Additional error details (optional)
 * @property {string} timestamp - ISO timestamp of error occurrence
 */
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

/**
 * @summary
 * Express error handling middleware
 *
 * @function errorMiddleware
 * @module middleware/error
 *
 * @param {Error} err - Error object
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 *
 * @returns {void}
 */
export function errorMiddleware(err: any, req: Request, res: Response, next: NextFunction): void {
  const statusCode = err.statusCode || 500;
  const errorCode = err.code || 'INTERNAL_SERVER_ERROR';
  const message = err.message || 'An unexpected error occurred';

  const errorResponse: ErrorResponse = {
    success: false,
    error: {
      code: errorCode,
      message: message,
      ...(err.details && { details: err.details }),
    },
    timestamp: new Date().toISOString(),
  };

  /**
   * @rule {be-error-logging}
   * Log errors in development mode
   */
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', err);
  }

  res.status(statusCode).json(errorResponse);
}
