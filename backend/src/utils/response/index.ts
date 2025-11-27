/**
 * @summary
 * Standardized API response utilities.
 * Provides consistent response formatting for success and error cases.
 *
 * @module utils/response
 */

/**
 * @interface SuccessResponse
 * @description Standard success response structure
 *
 * @property {boolean} success - Always true for successful responses
 * @property {T} data - Response data payload
 * @property {object} metadata - Optional metadata object
 * @property {string} metadata.timestamp - ISO timestamp of response
 */
export interface SuccessResponse<T> {
  success: true;
  data: T;
  metadata?: {
    timestamp: string;
    [key: string]: any;
  };
}

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
export interface ErrorResponse {
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
 * Creates a standardized success response
 *
 * @function successResponse
 * @module utils/response
 *
 * @param {T} data - Response data payload
 * @param {object} metadata - Optional metadata
 *
 * @returns {SuccessResponse<T>} Formatted success response
 */
export function successResponse<T>(data: T, metadata?: { [key: string]: any }): SuccessResponse<T> {
  return {
    success: true,
    data,
    metadata: {
      timestamp: new Date().toISOString(),
      ...metadata,
    },
  };
}

/**
 * @summary
 * Creates a standardized error response
 *
 * @function errorResponse
 * @module utils/response
 *
 * @param {string} message - Error message
 * @param {string} code - Error code identifier
 * @param {any} details - Additional error details
 *
 * @returns {ErrorResponse} Formatted error response
 */
export function errorResponse(
  message: string,
  code: string = 'ERROR',
  details?: any
): ErrorResponse {
  return {
    success: false,
    error: {
      code,
      message,
      ...(details && { details }),
    },
    timestamp: new Date().toISOString(),
  };
}
