const express = require('express');
const config = require('../config');
const database = require('../database');
const { formatBytes, formatUptime, createApiResponse } = require('../utils');

/**
 * API routes module
 * Contains health, version, and API information endpoints
 */

const router = express.Router();

/**
 * Health check endpoint
 * GET /health
 */
router.get('/health', async (req, res) => {
  try {
    const dbStatus = database.getStatus();
    const isDbHealthy = await database.isHealthy();
    
    const health = {
      success: true,
      status: 'Server is running',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: {
        connected: database.isConnected,
        healthy: isDbHealthy,
        state: dbStatus.state,
        host: dbStatus.host,
        port: dbStatus.port,
        name: dbStatus.name,
      },
      server: {
        environment: config.server.environment,
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        pid: process.pid,
      },
      memory: {
        ...process.memoryUsage(),
        formatted: {
          rss: formatBytes(process.memoryUsage().rss),
          heapTotal: formatBytes(process.memoryUsage().heapTotal),
          heapUsed: formatBytes(process.memoryUsage().heapUsed),
          external: formatBytes(process.memoryUsage().external),
        }
      },
      uptime: {
        raw: process.uptime(),
        formatted: formatUptime(process.uptime()),
      },
    };

    // Include detailed database stats if enabled and connected
    if (config.health.enableDetailedChecks && database.isConnected) {
      try {
        health.database.stats = await database.getStats();
      } catch (error) {
        health.database.statsError = error.message;
      }
    }

    res.json(health);
  } catch (error) {
    res.status(500).json({
      success: false,
      status: 'Health check failed',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * Version information endpoint
 * GET /api/version
 */
router.get('/version', (req, res) => {
  try {
    const packageJson = require('../../package.json');
    
    const versionInfo = {
      success: true,
      name: packageJson.name || config.app.name,
      version: packageJson.version || config.app.version,
      description: packageJson.description || config.app.description,
      environment: config.server.environment,
      nodeVersion: process.version,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      build: {
        date: new Date().toISOString(),
        commit: process.env.GIT_COMMIT || 'unknown',
        branch: process.env.GIT_BRANCH || 'unknown',
      },
      dependencies: {
        production: Object.keys(packageJson.dependencies || {}),
        development: Object.keys(packageJson.devDependencies || {}),
      },
    };

    res.json(versionInfo);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve version information',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * API information endpoint
 * GET /api
 */
router.get('/', (req, res) => {
  const apiInfo = {
    message: 'Welcome to RenderAPIs - CRUD API for Project Management',
    status: 'Server is running',
    database: database.isConnected ? 'Connected' : 'Disconnected',
    version: config.app.version,
    environment: config.server.environment,
    timestamp: new Date().toISOString(),
    endpoints: {
      // System endpoints
      'GET /': 'Dashboard (Static files)',
      'GET /health': 'Server and database health check',
      'GET /api': 'API information (this endpoint)',
      'GET /api/version': 'Version and build information',
      
      // Project endpoints
      'GET /api/projects': 'Get all projects',
      'GET /api/projects/:id': 'Get a single project',
      'POST /api/projects': 'Create a new project',
      'PUT /api/projects/:id': 'Update a project',
      'DELETE /api/projects/:id': 'Delete a project',
    },
    rateLimit: {
      windowMs: config.rateLimit.windowMs,
      max: config.rateLimit.max,
      message: 'Rate limiting active',
    },
    cors: {
      origin: config.cors.origin,
      methods: config.cors.methods,
    },
  };

  res.json(apiInfo);
});

/**
 * Server status endpoint
 * GET /status (alias for health)
 */
router.get('/status', (req, res) => {
  res.redirect('/health');
});

/**
 * API documentation endpoint
 * GET /api/docs
 */
router.get('/docs', (req, res) => {
  const documentation = {
    success: true,
    title: 'RenderAPIs Documentation',
    version: config.app.version,
    baseUrl: `${req.protocol}://${req.get('host')}`,
    endpoints: [
      {
        method: 'GET',
        path: '/health',
        description: 'Check server and database health',
        responses: {
          200: 'Health information with server and database status',
          500: 'Health check failed',
        },
      },
      {
        method: 'GET',
        path: '/api/version',
        description: 'Get version and build information',
        responses: {
          200: 'Version information including dependencies',
          500: 'Failed to retrieve version information',
        },
      },
      {
        method: 'GET',
        path: '/api/projects',
        description: 'Get all projects',
        auth: false,
        rateLimit: true,
        responses: {
          200: 'Array of projects with count',
          503: 'Database unavailable',
        },
      },
      {
        method: 'POST',
        path: '/api/projects',
        description: 'Create a new project',
        auth: false,
        rateLimit: true,
        body: {
          name: 'string (required)',
          description: 'string (required)',
          technologies: 'array of strings',
          status: 'planning|in-progress|completed|on-hold',
          repository: 'string (URL)',
          liveUrl: 'string (URL)',
        },
        responses: {
          201: 'Project created successfully',
          400: 'Validation error',
          503: 'Database unavailable',
        },
      },
    ],
    schemas: {
      Project: {
        _id: 'ObjectId',
        name: 'string (required)',
        description: 'string (required)',
        technologies: 'array of strings',
        status: 'string (enum: planning, in-progress, completed, on-hold)',
        startDate: 'Date',
        endDate: 'Date',
        repository: 'string',
        liveUrl: 'string',
        createdAt: 'Date',
        updatedAt: 'Date',
      },
    },
  };

  res.json(documentation);
});

module.exports = router;