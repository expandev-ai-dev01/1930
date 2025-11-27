/**
 * @summary
 * Internal API routes configuration for authenticated endpoints.
 * Handles all authenticated user operations and protected resources.
 *
 * @module routes/v1/internalRoutes
 */

import { Router } from 'express';
import * as taskController from '@/api/v1/internal/task/controller';
import * as taskHistoryController from '@/api/v1/internal/task-history/controller';

const router = Router();

/**
 * @rule {be-route-configuration}
 * Task management routes
 */
router.get('/task', taskController.listHandler);
router.post('/task', taskController.createHandler);
router.get('/task/:id', taskController.getHandler);
router.put('/task/:id', taskController.updateHandler);
router.delete('/task/:id', taskController.deleteHandler);
router.patch('/task/:id/status', taskController.updateStatusHandler);

/**
 * @rule {be-route-configuration}
 * Task history routes
 */
router.get('/task/:id/history', taskHistoryController.getHistoryHandler);

export default router;
