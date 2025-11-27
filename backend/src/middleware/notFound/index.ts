/**
 * @summary
 * 404 Not Found middleware for handling undefined routes.
 * Returns standardized error response for non-existent endpoints.
 *
 * @module middleware/notFound
 */

import { Request, Response } from 'express';

/**
 * @summary
 * Handles requests to undefined routes
 *
 * @function notFoundMiddleware
 * @module middleware/notFound
 *
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 *
 * @returns {void}
 */
export function notFoundMiddleware(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
      path: req.path,
      method: req.method,
    },
    timestamp: new Date().toISOString(),
  });
}
