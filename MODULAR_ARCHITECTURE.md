# RenderAPIs - Modular Architecture

## 📁 Project Structure

```
renderapis/
├── src/                          # Source code (modular architecture)
│   ├── config/                   # Configuration management
│   │   └── index.js             # Environment variables & app settings
│   ├── database/                 # Database connection & management
│   │   └── index.js             # MongoDB connection with auto-reconnect
│   ├── middleware/               # Express middleware
│   │   └── index.js             # Common middleware & error handling
│   ├── routes/                   # API route handlers
│   │   └── api.js               # Health, version, and API info endpoints
│   ├── utils/                    # Utility functions
│   │   └── index.js             # Common helper functions
│   ├── app.js                   # Application factory & initialization
│   └── index.js                 # Main export file
├── routes/                       # Legacy routes (to be moved)
│   └── projects.js              # Project CRUD operations
├── models/                       # MongoDB models
│   └── Project.js               # Project schema
├── public/                       # Static files & dashboard
├── postman/                      # API testing collection
├── server.js                     # Main server entry point
└── package.json                  # Dependencies & scripts
```

## 🏗️ Architecture Components

### 1. **Configuration Module** (`src/config/`)
- **Purpose**: Centralized environment variable management
- **Features**:
  - Environment-specific settings
  - Validation of required configuration
  - Type-safe configuration access
  - Development/Production/Test mode detection

```javascript
const config = require('./src/config');
console.log(config.server.port);        // 3000
console.log(config.database.uri);       // MongoDB URI
console.log(config.isDevelopment);      // true/false
```

### 2. **Database Module** (`src/database/`)
- **Purpose**: MongoDB connection management
- **Features**:
  - Auto-reconnection with retry logic
  - Connection state monitoring
  - Health checks and statistics
  - Graceful shutdown handling
  - Event-based connection status

```javascript
const database = require('./src/database');
await database.connect();
console.log(database.isConnected);      // true/false
const status = database.getStatus();    // Detailed status
```

### 3. **Middleware Module** (`src/middleware/`)
- **Purpose**: Express middleware and request processing
- **Features**:
  - Database connection checks
  - Rate limiting
  - Security headers
  - Request logging
  - Error handling
  - CORS configuration

```javascript
const middleware = require('./src/middleware');
app.use(middleware.checkDatabaseConnection);
app.use(middleware.createRateLimit());
```

### 4. **API Routes Module** (`src/routes/`)
- **Purpose**: System endpoints (health, version, docs)
- **Features**:
  - Health checks with detailed information
  - Version and build information
  - API documentation endpoint
  - Server statistics and monitoring

### 5. **Utilities Module** (`src/utils/`)
- **Purpose**: Common helper functions
- **Features**:
  - Data formatting (bytes, uptime)
  - Input validation and sanitization
  - API response standardization
  - ObjectId validation

### 6. **Application Factory** (`src/app.js`)
- **Purpose**: Express app creation and configuration
- **Features**:
  - Modular app assembly
  - Graceful shutdown handling
  - Error handling setup
  - Server initialization

## 🚀 Benefits of Modular Architecture

### **1. Separation of Concerns**
- Each module has a single, well-defined responsibility
- Easy to locate and modify specific functionality
- Reduced coupling between components

### **2. Improved Maintainability**
- Code is organized logically
- Easy to add new features without affecting existing code
- Clear dependency relationships

### **3. Enhanced Testability**
- Each module can be tested independently
- Mock dependencies easily
- Better test coverage

### **4. Scalability**
- Easy to add new modules and features
- Can be converted to microservices architecture
- Horizontal scaling preparation

### **5. Developer Experience**
- Clear code organization
- Easy onboarding for new developers
- Consistent coding patterns

## 🔧 Configuration Management

### Environment Variables
```bash
# Server Configuration
PORT=3000
HOST=localhost
NODE_ENV=development

# Database Configuration  
MONGODB_URI=mongodb://localhost:27017/renderapis

# Security Configuration
CORS_ORIGIN=*
TRUST_PROXY=true

# Logging Configuration
LOG_LEVEL=info
ENABLE_CONSOLE_LOG=true

# API Configuration
API_TIMEOUT=30000
HEALTH_DETAILED=true
```

### Configuration Access
```javascript
const config = require('./src/config');

// Server settings
const port = config.server.port;
const environment = config.server.environment;

// Database settings
const dbUri = config.database.uri;
const dbOptions = config.database.options;

// Feature flags
const isDev = config.isDevelopment;
const isProd = config.isProduction;
```

## 🔌 Database Management

### Connection Handling
```javascript
const database = require('./src/database');

// Connect to database
await database.connect();

// Check connection status
if (database.isConnected) {
  console.log('Database ready');
}

// Get detailed status
const status = database.getStatus();
console.log(status.state);        // 'connected'
console.log(status.host);         // 'localhost'
console.log(status.port);         // 27017

// Health check
const isHealthy = await database.isHealthy();

// Get statistics
const stats = await database.getStats();
```

### Connection Events
- `connected` - Database connected successfully
- `error` - Connection error occurred
- `disconnected` - Database disconnected
- `reconnected` - Reconnection successful

## 🛡️ Middleware Stack

### Security Middleware
- **CORS**: Cross-origin resource sharing
- **Security Headers**: XSS protection, content type options
- **Rate Limiting**: Request throttling
- **Request Timeout**: Prevent hanging requests

### Functional Middleware
- **Body Parsing**: JSON and URL-encoded data
- **Static Files**: Serve dashboard and assets
- **Request Logging**: Comprehensive request logging
- **Database Check**: Verify DB connection before processing

### Error Handling
- **Global Error Handler**: Catches all unhandled errors
- **404 Handler**: Not found responses
- **Validation Errors**: MongoDB and schema validation
- **Development vs Production**: Different error detail levels

## 📊 Monitoring & Health Checks

### Health Endpoint (`/health`)
```json
{
  "success": true,
  "status": "Server is running",
  "timestamp": "2025-10-30T...",
  "uptime": 3600,
  "database": {
    "connected": true,
    "healthy": true,
    "state": "connected",
    "host": "localhost",
    "port": 27017,
    "stats": { ... }
  },
  "server": {
    "environment": "development",
    "nodeVersion": "v18.17.0",
    "platform": "linux",
    "memory": { ... }
  }
}
```

### Version Endpoint (`/api/version`)
```json
{
  "success": true,
  "name": "renderapis",
  "version": "1.0.0",
  "environment": "development",
  "nodeVersion": "v18.17.0",
  "uptime": 3600,
  "build": {
    "date": "2025-10-30T...",
    "commit": "abc123",
    "branch": "main"
  },
  "dependencies": { ... }
}
```

## 🚦 Starting the Application

### Development Mode
```bash
npm start
# or
node server.js
```

### Production Mode
```bash
NODE_ENV=production npm start
```

### The application will:
1. ✅ Validate configuration
2. 🔗 Connect to MongoDB (with retry logic)
3. 🏗️ Initialize Express application
4. 🛡️ Setup middleware stack
5. 🛣️ Configure routes
6. 🚀 Start HTTP server
7. 📊 Display server information

## 🔄 Graceful Shutdown

The application handles shutdown signals gracefully:
- `SIGTERM` - Kubernetes/Docker shutdown
- `SIGINT` - Ctrl+C interrupt  
- `uncaughtException` - Unhandled exceptions
- `unhandledRejection` - Promise rejections

### Shutdown Process:
1. 🛑 Receive shutdown signal
2. 🔌 Close database connections
3. 🏁 Exit process cleanly

## 🧪 Testing the Modular Architecture

### Import Individual Modules
```javascript
const config = require('./src/config');
const database = require('./src/database');
const middleware = require('./src/middleware');
const utils = require('./src/utils');
```

### Test Database Connection
```javascript
const database = require('./src/database');
await database.connect();
console.log('Connected:', database.isConnected);
```

### Test Configuration
```javascript
const config = require('./src/config');
console.log('Port:', config.server.port);
console.log('Environment:', config.server.environment);
```

## 🎯 Next Steps

1. **Move Legacy Routes**: Migrate `routes/projects.js` to `src/routes/`
2. **Add Authentication**: Create auth middleware module
3. **Add Caching**: Redis integration module
4. **Add Logging**: Winston/Morgan logging module
5. **Add Validation**: Joi/express-validator module
6. **Add Testing**: Jest test suite with module testing
7. **Add Documentation**: OpenAPI/Swagger integration
8. **Add Monitoring**: Prometheus metrics module

The modular architecture is now ready for scalable development! 🚀