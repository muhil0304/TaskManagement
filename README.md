# Personal Task Management Application

A secure, production-ready, and zero-dependency **Personal Task Management Application** built with Express, TypeScript, and a robust file-backed JSON database.

## Architecture Overview

The application uses a decoupled **Client-Server Architecture** designed for high performance, security, and ease of deployment.

```mermaid
graph TD
    subgraph Client (React + Vite)
        UI[React Components] --> Context[Auth Context]
        UI --> API[API Client / Services]
    end

    subgraph Server (Express + TS)
        API --> Router[Express Router]
        Router --> AuthMW[Auth Middleware]
        AuthMW --> Controller[Controllers]
        Controller --> ValMW[Validation Middleware - Zod]
        ValMW --> DB[File-backed JSON DB]
    end
```

### Key Architectural & Security Features

1. **User Authentication**: Secure signup, login, and session persistence using JSON Web Tokens (JWT) and salted password hashing (`bcryptjs`).
2. **Task CRUD Operations**: Complete task management with Title, Description, Due Date, Priority (Low, Medium, High), and Status (Pending, Completed).
3. **Filtering & Sorting**: Advanced server-side filtering by status and priority, and sorting by due date or priority.
4. **Data Isolation**: Strict user-level data isolation. Users can only view, edit, or delete tasks they created.
5. **Robust Validation**: Strict schema validation on both frontend and backend using `Zod`.
6. **Security Middleware**:
   - `helmet` for secure HTTP headers.
   - `cors` for cross-origin resource sharing.
   - `express-rate-limit` to prevent brute-force attacks.
7. **Database Layer**: A robust, file-backed JSON database service (`db.ts`) with atomic file writes to prevent data corruption, ensuring the project is immediately runnable on any machine without external database installations.

---

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### Installation

1. Clone the repository and navigate to the project root:
   ```bash
   cd personal-task-management
   ```

2. Install all dependencies for the root and backend:
   ```bash
   npm run install:all
   ```

3. Configure environment variables:
   ```bash
   cp server/.env.example server/.env
   ```
   *(You can modify the `.env` file to customize the port, JWT secret, or database file path)*

### Running the Application

To run the backend server in development mode (with hot-reloading):
```bash
npm run dev:server
```

To build and run the backend server in production mode:
```bash
npm run build:server
npm run start:server
```

---

## API Documentation

### Authentication Endpoints

#### 1. Register User
- **URL**: `/api/auth/register`
- **Method**: `POST`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword123"
  }
  ```
- **Success Response (201 Created)**:
  ```json
  {
    "message": "User registered successfully",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "abc123xyz",
      "email": "user@example.com",
      "createdAt": "2023-10-27T12:00:00.000Z"
    }
  }
  ```

#### 2. Login User
- **URL**: `/api/auth/login`
- **Method**: `POST`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword123"
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "message": "Login successful",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "abc123xyz",
      "email": "user@example.com",
      "createdAt": "2023-10-27T12:00:00.000Z"
    }
  }
  ```

#### 3. Get Current User
- **URL**: `/api/auth/me`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <token>`
- **Success Response (200 OK)**:
  ```json
  {
    "user": {
      "id": "abc123xyz",
      "email": "user@example.com",
      "createdAt": "2023-10-27T12:00:00.000Z"
    }
  }
  ```

---

### Task Endpoints (Requires Authentication)

All task endpoints require the `Authorization: Bearer <token>` header.

#### 1. Create Task
- **URL**: `/api/tasks`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "title": "Complete Project Proposal",
    "description": "Draft the initial architecture and security review.",
    "dueDate": "2023-11-15T18:00:00.000Z",
    "priority": "high",
    "status": "pending"
  }
  ```
- **Success Response (201 Created)**:
  ```json
  {
    "id": "task987",
    "userId": "abc123xyz",
    "title": "Complete Project Proposal",
    "description": "Draft the initial architecture and security review.",
    "dueDate": "2023-11-15T18:00:00.000Z",
    "priority": "high",
    "status": "pending",
    "createdAt": "2023-10-27T12:30:00.000Z",
    "updatedAt": "2023-10-27T12:30:00.000Z"
  }
  ```

#### 2. Get All Tasks (with Filtering & Sorting)
- **URL**: `/api/tasks`
- **Method**: `GET`
- **Query Parameters (Optional)**:
  - `status`: `pending` | `completed`
  - `priority`: `low` | `medium` | `high`
  - `sortBy`: `dueDate` | `priority`
  - `order`: `asc` | `desc`
- **Success Response (200 OK)**:
  ```json
  [
    {
      "id": "task987",
      "userId": "abc123xyz",
      "title": "Complete Project Proposal",
      "description": "Draft the initial architecture and security review.",
      "dueDate": "2023-11-15T18:00:00.000Z",
      "priority": "high",
      "status": "pending",
      "createdAt": "2023-10-27T12:30:00.000Z",
      "updatedAt": "2023-10-27T12:30:00.000Z"
    }
  ]
  ```

#### 3. Get Task by ID
- **URL**: `/api/tasks/:id`
- **Method**: `GET`
- **Success Response (200 OK)**:
  ```json
  {
    "id": "task987",
    "userId": "abc123xyz",
    "title": "Complete Project Proposal",
    "description": "Draft the initial architecture and security review.",
    "dueDate": "2023-11-15T18:00:00.000Z",
    "priority": "high",
    "status": "pending",
    "createdAt": "2023-10-27T12:30:00.000Z",
    "updatedAt": "2023-10-27T12:30:00.000Z"
  }
  ```

#### 4. Update Task
- **URL**: `/api/tasks/:id`
- **Method**: `PUT`
- **Request Body** (All fields optional):
  ```json
  {
    "status": "completed"
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "id": "task987",
    "userId": "abc123xyz",
    "title": "Complete Project Proposal",
    "description": "Draft the initial architecture and security review.",
    "dueDate": "2023-11-15T18:00:00.000Z",
    "priority": "high",
    "status": "completed",
    "createdAt": "2023-10-27T12:30:00.000Z",
    "updatedAt": "2023-10-27T12:45:00.000Z"
  }
  ```

#### 5. Delete Task
- **URL**: `/api/tasks/:id`
- **Method**: `DELETE`
- **Success Response (204 No Content)**: *(No body returned)*