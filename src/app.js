const express = require('express');
const config = require('./config');
const database = require('./database');
const middleware = require('./middleware');
const apiRoutes = require('./routes/api');

/**
 * Application factory
 * Creates and configures the Express application
 */

/**
 * Create and configure Express application
 * @returns {express.Application}
 */
const createApp = () => {
  // Validate configuration
  config.validate();

  // Create Express app
  const app = express();

  // Setup common middleware
  middleware.setupCommonMiddleware(app);

  // Setup API routes
  setupRoutes(app);

  // Setup error handling (must be last)
  middleware.setupErrorHandling(app);

  return app;
};

/**
 * Setup application routes
 * @param {express.Application} app
 */
const setupRoutes = (app) => {
  // API routes (health, version, docs, etc.)
  app.use('/', apiRoutes);
  app.use('/api', apiRoutes);

  // Project routes with database check middleware
  const projectRoutes = require('../routes/projects');
  app.use('/api/projects', middleware.checkDatabaseConnection, projectRoutes);

  // Add rate limiting to API routes if in production
  if (config.isProduction) {
    const rateLimiter = middleware.createRateLimit();
    app.use('/api', rateLimiter);
  }
};

/**
 * Initialize the application
 * - Connects to database
 * - Sets up graceful shutdown
 * @returns {Promise<express.Application>}
 */
const initializeApp = async () => {
  console.log(`🚀 Initializing ${config.app.name} v${config.app.version}`);
  console.log(`🌍 Environment: ${config.server.environment}`);
  console.log(`🔧 Node.js: ${process.version}`);

  // Connect to database
  await database.connect();

  // Create app
  const app = createApp();

  // Setup graceful shutdown
  setupGracefulShutdown();

  console.log('✅ Application initialized successfully');
  return app;
};

/**
 * Setup graceful shutdown handlers
 */
const setupGracefulShutdown = () => {
  const gracefulShutdown = async (signal) => {
    console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);

    try {
      // Close database connection
      await database.disconnect();
      
      console.log('✅ Graceful shutdown completed');
      process.exit(0);
    } catch (error) {
      console.error('❌ Error during shutdown:', error);
      process.exit(1);
    }
  };

  // Handle shutdown signals
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    gracefulShutdown('uncaughtException');
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    gracefulShutdown('unhandledRejection');
  });
};

/**
 * Start the server
 * @param {express.Application} app
 * @returns {Promise<http.Server>}
 */
const startServer = async (app) => {
  return new Promise((resolve, reject) => {
    const server = app.listen(config.server.port, config.server.host, (error) => {
      if (error) {
        reject(error);
        return;
      }

      console.log(`\n🎯 Server Details:`);
      console.log(`   📍 Host: ${config.server.host}`);
      console.log(`   🔌 Port: ${config.server.port}`);
      console.log(`   🌐 URL: http://${config.server.host}:${config.server.port}`);
      console.log(`   📊 Dashboard: http://${config.server.host}:${config.server.port}`);
      console.log(`   🔍 Health: http://${config.server.host}:${config.server.port}/health`);
      console.log(`   📋 API: http://${config.server.host}:${config.server.port}/api`);
      console.log(`   📖 Docs: http://${config.server.host}:${config.server.port}/api/docs`);
      
      if (database.isConnected) {
        console.log(`   🗄️  Database: Connected`);
      } else {
        console.log(`   ⚠️  Database: Disconnected (running in offline mode)`);
      }

      console.log(`\n🚀 ${config.app.name} is ready to serve requests!`);
      console.log(`   Press Ctrl+C to stop the server\n`);

      resolve(server);
    });

    // Handle server errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${config.server.port} is already in use`);
      } else {
        console.error('❌ Server error:', error);
      }
      reject(error);
    });
  });
};

module.exports = {
  createApp,
  initializeApp,
  startServer,
  setupRoutes,
  setupGracefulShutdown,
};