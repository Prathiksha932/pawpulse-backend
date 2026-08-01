import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import routes from './routes/index.js';

import { requestId } from './middleware/requestId.js';
import { errorHandler } from './middleware/errorHandler.js';
import { logger } from './config/logger.js';

const app = express();

// Security headers — should run first, before anything else touches the request
app.use(helmet());

// CORS — restrict which frontends can call this API
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// Body parsers
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Response compression
app.use(compression());

// Attach a unique ID to every request, before any logging happens
app.use(requestId);

// Basic request logger (temporary — replaced by morgan properly in a later milestone)
app.use((req, res, next) => {
  logger.debug(`${req.method} ${req.originalUrl}`, { requestId: req.id });
  next();
});

// Health check — lets Render / uptime monitors confirm the server is alive
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'PawPulse API is running' });
});

// Versioned API routes
app.use('/api/v1', routes);

// 404 handler — anything that reaches here matched no route
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Centralized error handler — must be the LAST app.use()
app.use(errorHandler);

export default app;