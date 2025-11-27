/**
 * @summary
 * Main application entry point for Editor de Música Cifrada backend API.
 * Configures Express server with security middleware, CORS, compression,
 * and API routing with versioning support.
 *
 * @module server
 */

import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { config } from '@/config';
import { errorMiddleware } from '@/middleware/error';
import { notFoundMiddleware } from '@/middleware/notFound';
import apiRoutes from '@/routes';

const app: Application = express();

/**
 * @rule {be-security-middleware}
 * Apply security headers and CORS configuration
 */
app.use(helmet());
app.use(cors(config.api.cors));

/**
 * @rule {be-request-processing}
 * Configure request body parsing and compression
 */
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

/**
 * @rule {be-health-check}
 * Health check endpoint for monitoring
 */
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'editor-musica-cifrada-api',
  });
});

/**
 * @rule {be-api-versioning}
 * Mount API routes with version prefix
 */
app.use('/api', apiRoutes);

/**
 * @rule {be-error-handling}
 * Apply error handling middleware
 */
app.use(notFoundMiddleware);
app.use(errorMiddleware);

/**
 * @rule {be-graceful-shutdown}
 * Handle graceful shutdown on SIGTERM
 */
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

/**
 * @rule {be-server-startup}
 * Start HTTP server
 */
const server = app.listen(config.api.port, () => {
  console.log(`Server running on port ${config.api.port} in ${process.env.NODE_ENV} mode`);
  console.log(`API available at http://localhost:${config.api.port}/api/${config.api.version}`);
});

export default server;
