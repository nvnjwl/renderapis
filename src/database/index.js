const mongoose = require('mongoose');
const config = require('../config');

/**
 * Database connection module
 * Handles MongoDB connection, state management, and event handling
 */

class DatabaseManager {
  constructor() {
    this.isConnected = false;
    this.connectionState = 'disconnected';
    this.connectionAttempts = 0;
    this.maxRetries = 5;
    this.retryDelay = 5000; // 5 seconds
    
    this.setupEventHandlers();
  }

  /**
   * Setup MongoDB connection event handlers
   */
  setupEventHandlers() {
    mongoose.connection.on('connected', () => {
      this.isConnected = true;
      this.connectionState = 'connected';
      this.connectionAttempts = 0;
      console.log('✅ MongoDB connected successfully');
    });

    mongoose.connection.on('error', (error) => {
      this.isConnected = false;
      this.connectionState = 'error';
      console.error('❌ MongoDB connection error:', error.message);
    });

    mongoose.connection.on('disconnected', () => {
      this.isConnected = false;
      this.connectionState = 'disconnected';
      console.log('🔌 MongoDB disconnected');
      
      // Attempt reconnection in production
      if (config.isProduction && this.connectionAttempts < this.maxRetries) {
        this.scheduleReconnection();
      }
    });

    mongoose.connection.on('reconnected', () => {
      this.isConnected = true;
      this.connectionState = 'connected';
      console.log('🔄 MongoDB reconnected');
    });

    // Handle process termination
    process.on('SIGINT', () => {
      this.disconnect();
    });

    process.on('SIGTERM', () => {
      this.disconnect();
    });
  }

  /**
   * Connect to MongoDB
   * @returns {Promise<void>}
   */
  async connect() {
    try {
      console.log('🔗 Connecting to MongoDB...');
      
      await mongoose.connect(config.database.uri, config.database.options);
      
      console.log(`🌐 Database: ${config.database.uri.replace(/\/\/.*@/, '//***:***@')}`);
      
    } catch (error) {
      this.isConnected = false;
      this.connectionState = 'error';
      
      console.error('❌ MongoDB connection failed:', error.message);
      console.log('⚠️  Server will continue running without database functionality');
      
      // In development, we continue without DB
      if (config.isDevelopment) {
        console.log('🔧 Development mode: Server running without database');
      } else {
        // In production, we might want to retry
        this.scheduleReconnection();
      }
    }
  }

  /**
   * Schedule reconnection attempt
   */
  scheduleReconnection() {
    if (this.connectionAttempts >= this.maxRetries) {
      console.error(`❌ Max reconnection attempts (${this.maxRetries}) reached`);
      return;
    }

    this.connectionAttempts++;
    console.log(`🔄 Scheduling reconnection attempt ${this.connectionAttempts}/${this.maxRetries} in ${this.retryDelay/1000}s...`);
    
    setTimeout(() => {
      this.connect();
    }, this.retryDelay);
  }

  /**
   * Disconnect from MongoDB
   * @returns {Promise<void>}
   */
  async disconnect() {
    try {
      await mongoose.connection.close();
      console.log('👋 MongoDB connection closed gracefully');
    } catch (error) {
      console.error('❌ Error closing MongoDB connection:', error.message);
    }
  }

  /**
   * Get current connection status
   * @returns {Object}
   */
  getStatus() {
    return {
      isConnected: this.isConnected,
      state: this.connectionState,
      readyState: mongoose.connection.readyState,
      readyStateText: this.getReadyStateText(),
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      name: mongoose.connection.name,
      connectionAttempts: this.connectionAttempts,
    };
  }

  /**
   * Get human-readable connection state
   * @returns {string}
   */
  getReadyStateText() {
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    };
    return states[mongoose.connection.readyState] || 'unknown';
  }

  /**
   * Check if database is healthy
   * @returns {Promise<boolean>}
   */
  async isHealthy() {
    try {
      if (!this.isConnected) return false;
      
      // Ping the database
      await mongoose.connection.db.admin().ping();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get database statistics
   * @returns {Promise<Object>}
   */
  async getStats() {
    try {
      if (!this.isConnected) {
        return { error: 'Database not connected' };
      }

      const admin = mongoose.connection.db.admin();
      const stats = await mongoose.connection.db.stats();
      
      return {
        collections: stats.collections,
        documents: stats.objects,
        dataSize: stats.dataSize,
        storageSize: stats.storageSize,
        indexes: stats.indexes,
        indexSize: stats.indexSize,
      };
    } catch (error) {
      return { error: error.message };
    }
  }
}

// Create singleton instance
const databaseManager = new DatabaseManager();

module.exports = {
  manager: databaseManager,
  connect: () => databaseManager.connect(),
  disconnect: () => databaseManager.disconnect(),
  getStatus: () => databaseManager.getStatus(),
  isHealthy: () => databaseManager.isHealthy(),
  getStats: () => databaseManager.getStats(),
  get isConnected() {
    return databaseManager.isConnected;
  },
};