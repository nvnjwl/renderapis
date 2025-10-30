# RenderAPIs Postman Collection

## Overview

This Postman collection provides comprehensive testing for the RenderAPIs project management system. It includes all endpoints with proper error handling, validation tests, and automated test scripts.

## Collection Contents

### 1. Health & Status
- **Server Health Check** (`GET /health`) - Check server and database status
- **Server Version Info** (`GET /version`) - Get build and version information
- **API Root Info** (`GET /`) - Get welcome message and available endpoints

### 2. Projects CRUD
- **Create New Project** (`POST /api/projects`) - Create a new project
- **Get All Projects** (`GET /api/projects`) - Retrieve all projects
- **Get Project by ID** (`GET /api/projects/:id`) - Get specific project
- **Update Project** (`PUT /api/projects/:id`) - Update existing project
- **Delete Project** (`DELETE /api/projects/:id`) - Delete a project

### 3. Error Handling Tests
- **Get Non-existent Project** - Test 404 error handling
- **Invalid Project ID Format** - Test 400 validation errors
- **Create Project - Missing Required Fields** - Test validation errors

### 4. Rate Limiting Tests
- **Rate Limit Test** - Test the 100 requests per 15 minutes limit

## Installation & Setup

### Step 1: Import Collection
1. Open Postman
2. Click "Import" button
3. Select `RenderAPIs.postman_collection.json`
4. Click "Import"

### Step 2: Import Environment
1. Click the gear icon (⚙️) in the top right
2. Click "Import"
3. Select `RenderAPIs.postman_environment.json`
4. Click "Import"
5. Select "RenderAPIs Environment" from the environment dropdown

### Step 3: Configure Environment Variables
The environment includes these variables:
- `baseUrl`: Server base URL (default: `http://localhost:3000`)
- `projectId`: Auto-populated by create project requests
- `testProjectName`: Random project name for testing
- `testProjectDescription`: Default test description

## Usage Guide

### Quick Start
1. Start your RenderAPIs server (`npm start`)
2. Run the "Server Health Check" to verify connectivity
3. Run "Create New Project" to test project creation
4. The `projectId` will be automatically saved for other requests
5. Test other CRUD operations using the saved project ID

### Running Tests
Each request includes automated tests that verify:
- Response status codes
- Response structure and required fields
- Data validation
- Error handling

### Test Execution Order
For best results, run requests in this order:
1. Health & Status endpoints (any order)
2. Create New Project
3. Get All Projects
4. Get Project by ID
5. Update Project
6. Delete Project
7. Error handling tests
8. Rate limiting tests

## Environment Variables

| Variable | Description | Auto-Set |
|----------|-------------|----------|
| `baseUrl` | API base URL | No |
| `projectId` | Current project ID for testing | Yes |
| `testProjectName` | Random project name | No |
| `testProjectDescription` | Test project description | No |

## API Schema

### Project Object
```json
{
  "_id": "ObjectId",
  "name": "string (required)",
  "description": "string (required)",
  "technologies": ["string"],
  "status": "planning|in-progress|completed|on-hold",
  "startDate": "Date",
  "endDate": "Date",
  "repository": "string",
  "liveUrl": "string",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Response Format
All responses follow this structure:
```json
{
  "success": boolean,
  "message": "string",
  "data": object|array,
  "count": number, // Only for list endpoints
  "error": "string" // Only for error responses
}
```

## Rate Limiting

The API implements rate limiting:
- **Limit**: 100 requests per 15 minutes per IP
- **Headers**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`
- **Error Response**: 429 status with retry information

## Error Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request / Validation Error |
| 404 | Not Found |
| 429 | Too Many Requests |
| 500 | Internal Server Error |
| 503 | Service Unavailable (Database disconnected) |

## Advanced Usage

### Collection Variables
The collection automatically manages these variables:
- Sets `projectId` after successful project creation
- Clears `projectId` after project deletion
- Uses dynamic data for testing (random names, etc.)

### Global Tests
Every request includes global tests for:
- Response time (< 2000ms)
- Valid JSON response format

### Pre-request Scripts
Global pre-request script logs all request URLs for debugging.

## Troubleshooting

### Common Issues

**Connection Refused**
- Ensure server is running on the correct port
- Check `baseUrl` environment variable

**Database Unavailable (503 errors)**
- Verify MongoDB is running
- Check server logs for connection issues

**Rate Limit Exceeded (429 errors)**
- Wait 15 minutes or restart server to reset limits
- Reduce request frequency

**Validation Errors (400)**
- Check request body format
- Ensure required fields are included

### Debug Mode
Enable console logs in Postman to see detailed request/response information and test results.

## Collection Maintenance

### Updating Base URL
1. Go to Environment settings
2. Update `baseUrl` variable
3. Save changes

### Adding New Endpoints
1. Create new request in appropriate folder
2. Add test scripts following existing patterns
3. Update this documentation

### Running Collection Tests
Use Postman's Collection Runner to execute all tests automatically with detailed reporting.