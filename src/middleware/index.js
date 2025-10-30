const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const config = require('../config');
const database = require('../database');

/**
 * Middleware module
 * Contains all middleware functions and configurations
 */

/**
 * Database connection check middleware
 * Returns 503 if database is not connected
 */
const checkDatabaseConnection = (req, res, next) => {
  if (!database.isConnected) {
    return res.status(503).json({
      success: false,
      message: 'Database service unavailable. Please try again later.',
      error: 'MongoDB connection not established',
      timestamp: new Date().toISOString(),
    });
  }
  next();
};

/**
 * Request logging middleware
 */
const requestLogger = (req, res, next) => {
  if (config.logging.enableConsole) {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      const status = res.statusCode;
      const method = req.method;
      const url = req.originalUrl || req.url;
      const userAgent = req.get('User-Agent') || '-';
      const ip = req.ip || req.connection.remoteAddress || '-';
      
      // Color code based on status
      let statusColor = '\x1b[32m'; // Green for 2xx
      if (status >= 400) statusColor = '\x1b[31m'; // Red for 4xx/5xx
      else if (status >= 300) statusColor = '\x1b[33m'; // Yellow for 3xx
      
      console.log(
        `${statusColor}${status}\x1b[0m ${method} ${url} - ${duration}ms - ${ip} - ${userAgent.substring(0, 50)}`
      );
    });
  }
  next();
};

/**
 * Error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err);

  // Default error
  let error = {
    success: false,
    message: 'Internal server error',
    timestamp: new Date().toISOString(),
  };

  // Development mode - include stack trace
  if (config.isDevelopment) {
    error.error = err.message;
    error.stack = err.stack;
  }

  // Handle specific error types
  if (err.name === 'ValidationError') {
    error.message = 'Validation error';
    error.details = Object.values(err.errors).map(e => e.message);
    return res.status(400).json(error);
  }

  if (err.name === 'CastError') {
    error.message = 'Invalid ID format';
    return res.status(400).json(error);
  }

  if (err.name === 'MongoError' && err.code === 11000) {
    error.message = 'Duplicate field value';
    return res.status(400).json(error);
  }

  // Default 500 error
  res.status(500).json(error);
};

/**
 * 404 Not Found middleware
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    method: req.method,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Request timeout middleware
 */
const requestTimeout = (req, res, next) => {
  req.setTimeout(config.api.timeout, () => {
    res.status(408).json({
      success: false,
      message: 'Request timeout',
      timestamp: new Date().toISOString(),
    });
  });
  next();
};

/**
 * Security headers middleware
 */
const securityHeaders = (req, res, next) => {
  // Basic security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  if (config.isProduction) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  next();
};

/**
 * API version middleware
 */
const apiVersion = (req, res, next) => {
  res.setHeader('X-API-Version', config.api.version);
  next();
};

/**
 * Rate limiting middleware factory
 */
const createRateLimit = (options = {}) => {
  return rateLimit({
    ...config.rateLimit,
    ...options,
  });
};

/**
 * CORS middleware configuration
 */
const corsMiddleware = cors(config.cors);

/**
 * Common middleware setup function
 */
const setupCommonMiddleware = (app) => {
  // Trust proxy (important for rate limiting and IP detection)
  app.set('trust proxy', config.server.trustProxy);

  // Security headers
  app.use(securityHeaders);

  // Request timeout
  app.use(requestTimeout);

  // Request logging
  app.use(requestLogger);

  // CORS
  app.use(corsMiddleware);

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // API version header
  app.use(apiVersion);

  // Serve static files
  app.use(express.static(config.static.directory, {
    maxAge: config.static.maxAge,
  }));
};

/**
 * Setup error handling middleware
 */
const setupErrorHandling = (app) => {
  // 404 handler
  app.use(notFoundHandler);

  // Global error handler
  app.use(errorHandler);
};

module.exports = {
  // Individual middleware
  checkDatabaseConnection,
  requestLogger,
  errorHandler,
  notFoundHandler,
  requestTimeout,
  securityHeaders,
  apiVersion,
  corsMiddleware,

  // Middleware factories
  createRateLimit,

  // Setup functions
  setupCommonMiddleware,
  setupErrorHandling,
};