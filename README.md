# TaskManagement — Personal Task Manager

A modern, responsive, and enterprise-grade **Personal Task Management Application** built with **Next.js 15 (App Router)**, **React 19**, **Prisma**, **SQLite**, and **Tailwind CSS**.

## Features

- **Real-time Dashboard Metrics**: Instantly view total, completed, pending, and due today tasks.
- **Full CRUD Operations**: Create, read, update, and delete tasks with ease.
- **Rich Task Metadata**: Support for Title, Description, Status, Priority, Due Date, and Category/Tags.
- **Advanced Filtering & Search**: Filter tasks by status, priority, and category, or search by title/description.
- **Inline Completion Toggle**: Mark tasks as completed directly from the list view.
- **Responsive Design**: Optimized for mobile, tablet, and desktop screens.
- **SQLite Database**: Lightweight, zero-configuration database powered by Prisma ORM.

---

## Getting Started

### Prerequisites

Ensure you have **Node.js 18.18.0** or higher installed.

### Installation

1. **Clone the repository and navigate to the project directory**:
   ```bash
   cd TaskManagement
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```

4. **Initialize the SQLite database and run migrations**:
   ```bash
   npm run prisma:migrate
   ```

5. **Seed the database with initial tasks**:
   ```bash
   npm run prisma:seed
   ```

6. **Start the development server**:
   ```bash
   npm run dev
   ```

7. **Open the application**:
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```text
TaskManagement/
├── prisma/
│   ├── schema.prisma          # Database schema (Task model)
│   └── seed.ts                # Database seed script with initial tasks
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── tasks/
│   │   │   │   └── route.ts   # GET (list/filter) & POST (create) tasks
│   │   │   └── tasks/
│   │   │       └── [id]/
│   │   │           └── route.ts # PATCH (update) & DELETE (delete) task
│   │   ├── globals.css        # Global CSS with Tailwind directives
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Dashboard page (Client/Server coordinator)
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Badge.tsx      # Reusable status/priority badge
│   │   │   └── Modal.tsx      # Reusable modal dialog
│   │   ├── TaskCard.tsx       # Individual task item card
│   │   ├── TaskFilters.tsx    # Search and filter controls
│   │   ├── TaskFormModal.tsx  # Create/Edit task form modal
│   │   ├── TaskList.tsx       # Grid/List of tasks with empty states
│   │   └── TaskStats.tsx      # Dashboard metrics cards
│   ├── lib/
│   │   └── prisma.ts          # Prisma Client singleton
│   └── types/
│       └── index.ts           # Shared TypeScript interfaces
├── .env.example               # Environment variables template
├── next.config.js             # Next.js configuration
├── package.json               # Dependencies and scripts
├── postcss.config.js          # PostCSS configuration
├── README.md                  # Setup and run instructions
├── tailwind.config.js         # Tailwind CSS configuration
└── tsconfig.json              # TypeScript configuration
```

---

## Verification & Testing

- **Database Inspection**: You can run `npx prisma studio` to open a visual editor for your SQLite database.
- **API Endpoints**:
  - `GET /api/tasks`: Fetch all tasks (supports query parameters: `search`, `status`, `priority`, `category`).
  - `POST /api/tasks`: Create a new task.
  - `PATCH /api/tasks/[id]`: Update an existing task.
  - `DELETE /api/tasks/[id]`: Delete a task.
---