import { createServer } from 'http';
import app from './app.js';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import { logger } from './config/logger.js';
import { initializeSocket } from './config/socket.js';
import { initializeCronJobs } from './config/cron.js';
// ... inside startServer(), after httpServer.listen(...):


const startServer = async () => {
  await connectDB();

  // Create the HTTP server from Express
  const httpServer = createServer(app);

  // Attach Socket.IO
  initializeSocket(httpServer);

  // Start listening
  httpServer.listen(env.PORT, () => {
    logger.info(`Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
  });
  initializeCronJobs();

  process.on('unhandledRejection', (err) => {
    logger.error(`Unhandled Rejection: ${err.message}`);
    httpServer.close(() => process.exit(1));
  });
};

startServer();