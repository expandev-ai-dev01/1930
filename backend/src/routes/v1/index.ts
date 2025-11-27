/**
 * @summary
 * Version 1 API router configuration.
 * Separates external (public) and internal (authenticated) routes.
 *
 * @module routes/v1
 */

import { Router } from 'express';
import externalRoutes from './externalRoutes';
import internalRoutes from './internalRoutes';

const router = Router();

/**
 * @rule {be-route-separation}
 * External routes - public access endpoints
 */
router.use('/external', externalRoutes);

/**
 * @rule {be-route-separation}
 * Internal routes - authenticated access endpoints
 */
router.use('/internal', internalRoutes);

export default router;
