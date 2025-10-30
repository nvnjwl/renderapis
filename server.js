const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/renderapis';
const PORT = process.env.PORT || 3000;

mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Import routes
const projectRoutes = require('./routes/projects');

// Routes
app.use('/api/projects', projectRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to RenderAPIs - CRUD API for Projects',
    endpoints: {
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
