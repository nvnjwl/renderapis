# renderapis

A Node.js + MongoDB RESTful API for managing projects with full CRUD operations. Each route represents a project endpoint for creating, reading, updating, and deleting project data.

## Features

- ✅ Create new projects
- ✅ Retrieve all projects
- ✅ Retrieve a single project by ID
- ✅ Update existing projects
- ✅ Delete projects
- ✅ MongoDB integration with Mongoose
- ✅ RESTful API architecture
- ✅ Input validation
- ✅ Error handling

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB
- **ODM:** Mongoose
- **Environment Variables:** dotenv
- **CORS:** cors

## Installation

1. Clone the repository:
```bash
git clone https://github.com/nvnjwl/renderapis.git
cd renderapis
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Configure your MongoDB connection in `.env`:
```
MONGODB_URI=mongodb://localhost:27017/renderapis
PORT=3000
```

## Running the Application

### Development mode (with auto-reload):
```bash
npm run dev
```

### Production mode:
```bash
npm start
```

The server will start on `http://localhost:3000` (or the port specified in your `.env` file).

## API Endpoints

### Base URL
```
http://localhost:3000
```

### Project Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | Get all projects |
| GET | `/api/projects/:id` | Get a single project by ID |
| POST | `/api/projects` | Create a new project |
| PUT | `/api/projects/:id` | Update a project by ID |
| DELETE | `/api/projects/:id` | Delete a project by ID |

### Example Requests

#### 1. Create a Project (POST)
```bash
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "name": "E-Commerce Website",
    "description": "A full-stack e-commerce platform",
    "technologies": ["Node.js", "React", "MongoDB"],
    "status": "in-progress",
    "repository": "https://github.com/example/ecommerce",
    "liveUrl": "https://example-ecommerce.com"
  }'
```

#### 2. Get All Projects (GET)
```bash
curl http://localhost:3000/api/projects
```

#### 3. Get Single Project (GET)
```bash
curl http://localhost:3000/api/projects/507f1f77bcf86cd799439011
```

#### 4. Update a Project (PUT)
```bash
curl -X PUT http://localhost:3000/api/projects/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "completed",
    "endDate": "2025-10-30"
  }'
```

#### 5. Delete a Project (DELETE)
```bash
curl -X DELETE http://localhost:3000/api/projects/507f1f77bcf86cd799439011
```

## Project Model Schema

```javascript
{
  name: String (required),
  description: String (required),
  technologies: [String],
  status: String (enum: 'planning', 'in-progress', 'completed', 'on-hold'),
  startDate: Date,
  endDate: Date,
  repository: String,
  liveUrl: String,
  timestamps: true (createdAt, updatedAt)
}
```

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation message",
  "data": { /* project data */ }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error information"
}
```

## Project Structure

```
renderapis/
├── models/
│   └── Project.js          # Project schema definition
├── routes/
│   └── projects.js         # CRUD route handlers
├── .env.example            # Environment variables template
├── .gitignore              # Git ignore file
├── package.json            # Project dependencies
├── server.js               # Application entry point
└── README.md               # Documentation
```

## MongoDB Setup

### Local MongoDB
1. Install MongoDB on your system
2. Start MongoDB service
3. Use the default connection string in `.env`

### MongoDB Atlas (Cloud)
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string
4. Update `MONGODB_URI` in `.env` with your Atlas connection string

## Deployment

This application is ready for deployment on platforms like:
- **Render** (recommended)
- **Heroku**
- **Railway**
- **Vercel**
- **AWS**

Make sure to set up environment variables on your deployment platform.

## License

ISC
