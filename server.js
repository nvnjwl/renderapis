#!/usr/bin/env node

/**
 * RenderAPIs Server
 * 
 * A modular, scalable Express.js server for project management APIs
 * 
 * Features:
 * - Modular architecture with separated concerns
 * - Comprehensive error handling and logging
 * - Database connection management with auto-reconnect
 * - Rate limiting and security middleware
 * - Graceful shutdown handling
 * - Health checks and monitoring endpoints
 * 
 * @author RenderAPIs Team
 * @version 1.0.0
 */

const { initializeApp, startServer } = require('./src/app');

/**
 * Main server entry point
 */
const main = async () => {
  try {
    // Initialize application
    const app = await initializeApp();
    
    // Start server
    await startServer(app);
    
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    
    // Log full error in development
    if (process.env.NODE_ENV === 'development') {
      console.error(error);
    }
    
    process.exit(1);
  }
};

// Start the application
if (require.main === module) {
  main();
}

module.exports = { main };
