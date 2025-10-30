# API Testing Examples

This file contains example API calls you can use to test the CRUD operations.

## Prerequisites

1. Start the server:
```bash
npm run dev
```

2. Ensure MongoDB is running (locally or via Atlas)

## Test Examples Using cURL

### 1. Health Check - Root Endpoint
```bash
curl http://localhost:3000/
```

### 2. Create a New Project
```bash
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Portfolio Website",
    "description": "Personal portfolio website showcasing projects",
    "technologies": ["HTML", "CSS", "JavaScript", "Node.js"],
    "status": "in-progress",
    "repository": "https://github.com/example/portfolio",
    "liveUrl": "https://portfolio.example.com"
  }'
```

### 3. Get All Projects
```bash
curl http://localhost:3000/api/projects
```

### 4. Get a Single Project (replace {id} with actual project ID)
```bash
curl http://localhost:3000/api/projects/{id}
```

### 5. Update a Project (replace {id} with actual project ID)
```bash
curl -X PUT http://localhost:3000/api/projects/{id} \
  -H "Content-Type: application/json" \
  -d '{
    "status": "completed",
    "endDate": "2025-10-30T00:00:00.000Z"
  }'
```

### 6. Delete a Project (replace {id} with actual project ID)
```bash
curl -X DELETE http://localhost:3000/api/projects/{id}
```

## Test Examples Using JavaScript/Node.js

### Create Project
```javascript
fetch('http://localhost:3000/api/projects', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'E-Commerce Platform',
    description: 'Full-stack e-commerce application',
    technologies: ['React', 'Node.js', 'MongoDB', 'Express'],
    status: 'planning'
  })
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));
```

### Get All Projects
```javascript
fetch('http://localhost:3000/api/projects')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));
```

## Test Using Postman

1. Import the following collection structure:
   - **GET** `http://localhost:3000/api/projects` - Get all projects
   - **GET** `http://localhost:3000/api/projects/:id` - Get single project
   - **POST** `http://localhost:3000/api/projects` - Create project
   - **PUT** `http://localhost:3000/api/projects/:id` - Update project
   - **DELETE** `http://localhost:3000/api/projects/:id` - Delete project

2. For POST and PUT requests, add this JSON body:
```json
{
  "name": "Test Project",
  "description": "This is a test project",
  "technologies": ["Node.js", "Express", "MongoDB"],
  "status": "in-progress"
}
```

## Expected Response Format

### Success Response
```json
{
  "success": true,
  "message": "Project created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Portfolio Website",
    "description": "Personal portfolio website",
    "technologies": ["HTML", "CSS", "JavaScript"],
    "status": "in-progress",
    "startDate": "2025-10-30T05:14:29.729Z",
    "createdAt": "2025-10-30T05:14:29.729Z",
    "updatedAt": "2025-10-30T05:14:29.729Z"
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error creating project",
  "error": "Project validation failed: name: Path `name` is required."
}
```
