# TaskFlow — Personal Task Management Application

TaskFlow is a production-ready, highly responsive **Personal Task Management Application** built using Next.js (App Router), Tailwind CSS, TypeScript, Prisma, and SQLite.

## Features

- **Interactive Dashboard**: Real-time statistics overview (Total, Completed, Pending, and Due Today tasks).
- **Full CRUD Operations**: Create, read, update, and delete tasks with instant UI updates.
- **Advanced Search & Filtering**: Search by title/description, and filter by Status, Priority, and Category.
- **Dynamic Sorting**: Sort tasks by Due Date, Priority, or Creation Date.
- **Responsive Design**: Mobile-first layout with smooth transitions and interactive states.
- **Robust Feedback**: Toast notifications for all user actions (success, error, info).
- **Zero-Config Database**: SQLite database pre-configured and ready to run immediately.

---

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database ORM**: Prisma
- **Database Engine**: SQLite (file-based)
- **Icons**: Lucide React

---

## Getting Started

### Prerequisites

Ensure you have **Node.js** (v18.x or later) and **npm** installed.

### Installation

1. Clone or extract the project files into your workspace.
2. Install the dependencies:
   ```bash
   npm install
   ```

3. Copy the environment template:
   ```bash
   cp .env.example .env
   ```

### Database Setup

Initialize the SQLite database and run migrations:
```bash
npx prisma migrate dev --name init
```

This will automatically create the SQLite database file (`prisma/dev.db`), apply the schema, and run the seed script to populate the database with sample tasks.

### Running the Application

Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## Project Structure

```text
TaskManagement/
├── prisma/
│   ├── schema.prisma         # Prisma schema with SQLite configuration & Task model
│   └── seed.ts               # Database seed script for immediate testing data
├── src/
│   ├── app/
│   │   ├── actions/
│   │   │   └── taskActions.ts # Server Actions for CRUD operations
│   │   ├── globals.css       # Global styles and Tailwind directives
│   │   ├── layout.tsx        # Root layout with font and global layout structure
│   │   └── page.tsx          # Main dashboard page (Stats, Filters, Search, List)
│   ├── components/
│   │   ├── DashboardStats.tsx # Statistics overview cards
│   │   ├── TaskCard.tsx      # Individual task item component
│   │   ├── TaskModal.tsx     # Create/Edit task modal form
│   │   ├── DeleteConfirmModal.tsx # Delete confirmation modal
│   │   └── Toast.tsx         # Context-based or state-driven toast notification
│   └── lib/
│       └── prisma.ts         # Prisma Client singleton helper
├── .env.example              # Environment variables template
├── next.config.ts            # Next.js configuration
├── package.json              # Project dependencies and scripts
├── postcss.config.js         # PostCSS configuration
├── tailwind.config.ts        # Tailwind CSS configuration
└── tsconfig.json             # TypeScript configuration
```

---

## Production Build

To build the application for production:
```bash
npm run build
```

To start the production server:
```bash
npm run start