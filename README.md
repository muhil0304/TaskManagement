# TaskFlow - Task Management Application

A complete, modern, and responsive Kanban-style Task Management application built with React, Tailwind CSS, Express, and SQLite3.

## Features

- **Kanban Board Layout**: Columns for 'To Do', 'In Progress', and 'Done'.
- **Task Cards**: Displays title, description, priority badge (Low, Medium, High), due date, and action buttons.
- **Task Management**: Create, edit, and delete tasks with ease.
- **Status Transitions**: Move tasks between columns using intuitive quick-action buttons.
- **Search & Filter**: Search tasks by title/description and filter by priority.
- **Overdue Indicators**: Highlights tasks that are past their due date.
- **Responsive Design**: Beautifully optimized for mobile, tablet, and desktop screens.
- **Robust Backend**: Express server with SQLite3 database for persistent storage.

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm

### Installation

1. Install dependencies for both backend and frontend:
   ```bash
   npm run install-all
   ```

### Running the Application

You can run both the backend and frontend concurrently:

```bash
npm run dev
```

Alternatively, you can run them in separate terminals:

**Backend:**
```bash
npm run start-backend
```
The backend server will run on `http://localhost:5000`.

**Frontend:**
```bash
npm run start-frontend
```
The frontend development server will run on `http://localhost:3000`.