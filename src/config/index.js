const path = require('path');

/**
 * Configuration module for RenderAPIs
 * Centralizes all environment variables and application settings
 */

// Load environment variables
require('dotenv').config();

const config = {
  // Server Configuration
  server: {
    port: process.env.PORT || 3000,
    host: process.env.HOST || 'localhost',
    environment: process.env.NODE_ENV || 'development',
    trustProxy: process.env.TRUST_PROXY === 'true' || true, // Enable for development
  },

  // Database Configuration
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/renderapis',
    options: {
      // Mongoose connection options (updated for newer versions)
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    },
  },

  // Application Metadata
  app: {
    name: 'RenderAPIs',
    version: process.env.npm_package_version || '1.0.0',
    description: 'CRUD API for Project Management',
  },

  // Static Files Configuration
  static: {
    directory: path.join(__dirname, '../../public'),
    maxAge: process.env.NODE_ENV === 'production' ? '1d' : 0,
  },

  // CORS Configuration
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: process.env.CORS_CREDENTIALS === 'true' || false,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  },

  // Rate Limiting Configuration
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // requests per window
    message: {
      success: false,
      message: 'Too many requests from this IP, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
  },

  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'combined',
    enableConsole: process.env.ENABLE_CONSOLE_LOG !== 'false',
  },

  // API Configuration
  api: {
    prefix: '/api',
    version: 'v1',
    timeout: parseInt(process.env.API_TIMEOUT) || 30000,
  },

  // Health Check Configuration
  health: {
    enableDetailedChecks: process.env.HEALTH_DETAILED === 'true' || true,
    checkInterval: parseInt(process.env.HEALTH_CHECK_INTERVAL) || 30000,
  },
};

// Validation function to ensure required config is present
const validateConfig = () => {
  const required = [
    'server.port',
    'database.uri',
  ];

  for (const key of required) {
    const keys = key.split('.');
    let value = config;
    for (const k of keys) {
      value = value[k];
    }
    if (!value) {
      throw new Error(`Missing required configuration: ${key}`);
    }
  }
};

// Export configuration
module.exports = {
  ...config,
  validate: validateConfig,
  isDevelopment: config.server.environment === 'development',
  isProduction: config.server.environment === 'production',
  isTest: config.server.environment === 'test',
};