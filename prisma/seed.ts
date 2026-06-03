import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clear existing tasks to prevent duplicates on re-seed
  await prisma.task.deleteMany({});

  const tasks = [
    {
      title: 'Design Landing Page',
      description: 'Create high-fidelity wireframes and design system for the new landing page.',
      status: 'In Progress',
      priority: 'High',
      category: 'Work',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    },
    {
      title: 'Buy Groceries',
      description: 'Milk, eggs, bread, chicken breast, and fresh vegetables.',
      status: 'To Do',
      priority: 'Low',
      category: 'Personal',
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
    },
    {
      title: 'Setup CI/CD Pipeline',
      description: 'Configure GitHub Actions for automated testing and deployment to Vercel.',
      status: 'To Do',
      priority: 'High',
      category: 'Work',
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    },
    {
      title: 'Read 10 pages of book',
      description: 'Continue reading "Atomic Habits" chapter 4.',
      status: 'Completed',
      priority: 'Medium',
      category: 'Personal',
      dueDate: new Date(), // Today
    },
    {
      title: 'Weekly Team Sync',
      description: 'Prepare status updates and review sprint goals with the engineering team.',
      status: 'Completed',
      priority: 'Medium',
      category: 'Work',
      dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Yesterday
    },
    {
      title: 'Gym Session',
      description: 'Leg day workout and 20 minutes of cardio.',
      status: 'To Do',
      priority: 'Medium',
      category: 'Personal',
      dueDate: new Date(), // Today
    }
  ];

  console.log('Seeding database...');
  for (const task of tasks) {
    await prisma.task.create({
      data: task,
    });
  }
  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });