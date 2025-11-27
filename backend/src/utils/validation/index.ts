/**
 * @summary
 * Common validation utilities using Zod schemas.
 * Provides reusable validation patterns for consistent data validation.
 *
 * @module utils/validation
 */

import { z } from 'zod';

/**
 * @rule {be-zod-validation}
 * Common Zod validation schemas for reuse across the application
 */

export const zString = z.string().min(1);
export const zNullableString = z.string().nullable();
export const zName = z.string().min(1).max(200);
export const zNullableDescription = z.string().max(500).nullable();
export const zBit = z.number().int().min(0).max(1);
export const zFK = z.number().int().positive();
export const zNullableFK = z.number().int().positive().nullable();
export const zDateString = z.string().datetime();

/**
 * @summary
 * Validates email format
 */
export const zEmail = z.string().email().max(100);

/**
 * @summary
 * Validates positive integer
 */
export const zPositiveInt = z.number().int().positive();

/**
 * @summary
 * Validates non-negative integer
 */
export const zNonNegativeInt = z.number().int().min(0);
