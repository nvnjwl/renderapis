const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Trust proxy for rate limiting in development
app.set('trust proxy', 1);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static('public'));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/renderapis';
const PORT = process.env.PORT || 3000;

// Database connection state
let isDbConnected = false;

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected successfully');
    isDbConnected = true;
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    console.log('Server will continue running without database functionality');
    isDbConnected = false;
  });

// Handle MongoDB connection events
mongoose.connection.on('connected', () => {
  console.log('MongoDB connected');
  isDbConnected = true;
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
  isDbConnected = false;
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
  isDbConnected = false;
});

// Middleware to check database connection
const checkDbConnection = (req, res, next) => {
  if (!isDbConnected) {
    return res.status(503).json({
      success: false,
      message: 'Database service unavailable. Please try again later.',
      error: 'MongoDB connection not established'
    });
  }
  next();
};

// Import routes
const projectRoutes = require('./routes/projects');

// Routes - Apply database check middleware to database-dependent routes
app.use('/api/projects', checkDbConnection, projectRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'Server is running',
    database: isDbConnected ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString()
  });
});

// Version endpoint
app.get('/api/version', (req, res) => {
  const packageJson = require('./package.json');
  res.json({
    success: true,
    name: packageJson.name,
    version: packageJson.version,
    description: packageJson.description,
    environment: process.env.NODE_ENV || 'development',
    nodeVersion: process.version,
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// API root route
app.get('/api', (req, res) => {
  res.json({
    message: 'Welcome to RenderAPIs - CRUD API for Projects',
    status: 'Server is running',
    database: isDbConnected ? 'Connected' : 'Disconnected',
    endpoints: {
      'GET /': 'Dashboard (Static files)',
      'GET /health': 'Check server and database status',
      'GET /api/version': 'Get version and build information',
      'GET /api/projects': 'Get all projects',
      'GET /api/projects/:id': 'Get a single project',
      'POST /api/projects': 'Create a new project',
      'PUT /api/projects/:id': 'Update a project',
      'DELETE /api/projects/:id': 'Delete a project'
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
