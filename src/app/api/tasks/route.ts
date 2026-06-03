import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    // Build filter query
    const where: any = {};

    if (status && status !== 'all') {
      where.status = status;
    }
    if (priority && priority !== 'all') {
      where.priority = priority;
    }
    if (category && category !== 'all') {
      where.category = category;
    }
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const tasks = await prisma.task.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ data: tasks });
  } catch (error: any) {
    console.error('GET /api/tasks error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks: ' + error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, status, priority, dueDate, category } = body;

    if (!title || typeof title !== 'string' || title.trim() === '') {
      return NextResponse.json(
        { error: 'Title is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    const task = await prisma.task.create({
      data: {
        title: title.trim(),
        description: description ? description.trim() : null,
        status: status || 'To Do',
        priority: priority || 'Medium',
        dueDate: dueDate ? new Date(dueDate) : null,
        category: category ? category.trim() : null,
      },
    });

    return NextResponse.json({ data: task }, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/tasks error:', error);
    return NextResponse.json(
      { error: 'Failed to create task: ' + error.message },
      { status: 500 }
    );
  }
}