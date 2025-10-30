/**
 * Utility functions
 * Common helper functions used throughout the application
 */

/**
 * Format bytes to human readable format
 * @param {number} bytes 
 * @param {number} decimals 
 * @returns {string}
 */
const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * Format uptime to human readable format
 * @param {number} seconds 
 * @returns {string}
 */
const formatUptime = (seconds) => {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);
  
  return parts.join(' ');
};

/**
 * Validate MongoDB ObjectId
 * @param {string} id 
 * @returns {boolean}
 */
const isValidObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

/**
 * Sanitize user input by removing dangerous characters
 * @param {string} input 
 * @returns {string}
 */
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};

/**
 * Generate a random string
 * @param {number} length 
 * @returns {string}
 */
const generateRandomString = (length = 10) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Delay execution for specified milliseconds
 * @param {number} ms 
 * @returns {Promise}
 */
const delay = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Create standardized API response
 * @param {boolean} success 
 * @param {string} message 
 * @param {any} data 
 * @param {any} error 
 * @returns {Object}
 */
const createApiResponse = (success, message, data = null, error = null) => {
  const response = {
    success,
    message,
    timestamp: new Date().toISOString(),
  };
  
  if (data !== null) response.data = data;
  if (error !== null) response.error = error;
  
  return response;
};

/**
 * Parse and validate JSON safely
 * @param {string} jsonString 
 * @returns {Object|null}
 */
const safeJsonParse = (jsonString) => {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    return null;
  }
};

/**
 * Get client IP address from request
 * @param {Object} req Express request object
 * @returns {string}
 */
const getClientIp = (req) => {
  return req.ip || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
         '0.0.0.0';
};

/**
 * Check if running in development mode
 * @returns {boolean}
 */
const isDevelopment = () => {
  return process.env.NODE_ENV === 'development';
};

/**
 * Check if running in production mode
 * @returns {boolean}
 */
const isProduction = () => {
  return process.env.NODE_ENV === 'production';
};

/**
 * Check if running in test mode
 * @returns {boolean}
 */
const isTest = () => {
  return process.env.NODE_ENV === 'test';
};

module.exports = {
  formatBytes,
  formatUptime,
  isValidObjectId,
  sanitizeInput,
  generateRandomString,
  delay,
  createApiResponse,
  safeJsonParse,
  getClientIp,
  isDevelopment,
  isProduction,
  isTest,
};