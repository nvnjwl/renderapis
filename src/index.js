/**
 * RenderAPIs Main Export
 * 
 * Central export file for the RenderAPIs application
 * Provides access to all major components and utilities
 */

const config = require('./src/config');
const database = require('./src/database');
const middleware = require('./src/middleware');
const app = require('./src/app');

module.exports = {
  // Configuration
  config,
  
  // Database management
  database,
  
  // Middleware utilities
  middleware,
  
  // Application factory
  app,
  
  // Version information
  version: require('./package.json').version,
  name: require('./package.json').name,
};