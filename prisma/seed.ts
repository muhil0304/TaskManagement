import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clear existing tasks
  await prisma.task.deleteMany({});

  const tasks = [
    {
      title: 'Design Dashboard Wireframes',
      description: 'Create high-fidelity wireframes for the new personal task manager dashboard.',
      status: 'COMPLETED',
      priority: 'HIGH',
      category: 'Work',
      dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
    },
    {
      title: 'Implement Authentication',
      description: 'Set up NextAuth or simple session management for user login.',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      category: 'Work',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // In 2 days
    },
    {
      title: 'Weekly Grocery Shopping',
      description: 'Buy fresh vegetables, milk, eggs, and chicken breast.',
      status: 'PENDING',
      priority: 'MEDIUM',
      category: 'Personal',
      dueDate: new Date(Date.now() + 12 * 60 * 60 * 1000), // Today later
    },
    {
      title: 'Gym Session - Leg Day',
      description: 'Squats, lunges, leg press, and calves.',
      status: 'PENDING',
      priority: 'LOW',
      category: 'Health',
      dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // In 4 days
    },
    {
      title: 'Review Monthly Budget',
      description: 'Analyze expenses for last month and allocate savings.',
      status: 'PENDING',
      priority: 'MEDIUM',
      category: 'Finance',
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // In 5 days
    }
  ];

  for (const task of tasks) {
    await prisma.task.create({
      data: task,
    });
  }

  console.log('Database seeded successfully with 5 tasks.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });