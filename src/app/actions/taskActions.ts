'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export interface TaskFilters {
  search?: string;
  status?: string;
  priority?: string;
  category?: string;
  sortBy?: 'dueDate' | 'priority' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export async function getTasks(filters?: TaskFilters) {
  try {
    const where: any = {};

    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search } },
        { description: { contains: filters.search } },
      ];
    }

    if (filters?.status && filters.status !== 'ALL') {
      where.status = filters.status;
    }

    if (filters?.priority && filters.priority !== 'ALL') {
      where.priority = filters.priority;
    }

    if (filters?.category && filters.category !== 'ALL') {
      where.category = filters.category;
    }

    let orderBy: any = { createdAt: 'desc' };

    if (filters?.sortBy) {
      if (filters.sortBy === 'dueDate') {
        orderBy = { dueDate: filters.sortOrder || 'asc' };
      } else if (filters.sortBy === 'priority') {
        orderBy = { priority: filters.sortOrder || 'asc' };
      } else {
        orderBy = { createdAt: filters.sortOrder || 'desc' };
      }
    }

    const tasks = await prisma.task.findMany({
      where,
      orderBy,
    });

    return { success: true, data: tasks };
  } catch (error: any) {
    console.error('Failed to fetch tasks:', error);
    return { success: false, error: error.message || 'Failed to fetch tasks' };
  }
}

export async function getTaskStats() {
  try {
    const tasks = await prisma.task.findMany();
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'COMPLETED').length;
    const pending = tasks.filter(t => t.status === 'PENDING').length;
    const inProgress = tasks.filter(t => t.status === 'IN_PROGRESS').length;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dueToday = tasks.filter(t => {
      if (!t.dueDate) return false;
      const d = new Date(t.dueDate);
      return d >= today && d < tomorrow;
    }).length;

    return {
      success: true,
      data: { total, completed, pending: pending + inProgress, dueToday }
    };
  } catch (error: any) {
    console.error('Failed to fetch stats:', error);
    return { success: false, error: error.message || 'Failed to fetch stats' };
  }
}

export async function createTask(data: {
  title: string;
  description?: string;
  status: string;
  priority: string;
  category: string;
  dueDate?: string | null;
}) {
  try {
    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description || null,
        status: data.status,
        priority: data.priority,
        category: data.category,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
      },
    });
    revalidatePath('/');
    return { success: true, data: task };
  } catch (error: any) {
    console.error('Failed to create task:', error);
    return { success: false, error: error.message || 'Failed to create task' };
  }
}

export async function updateTask(
  id: string,
  data: {
    title?: string;
    description?: string | null;
    status?: string;
    priority?: string;
    category?: string;
    dueDate?: string | null;
  }
) {
  try {
    const updateData: any = { ...data };
    if (data.dueDate !== undefined) {
      updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
    }
    const task = await prisma.task.update({
      where: { id },
      data: updateData,
    });
    revalidatePath('/');
    return { success: true, data: task };
  } catch (error: any) {
    console.error('Failed to update task:', error);
    return { success: false, error: error.message || 'Failed to update task' };
  }
}

export async function deleteTask(id: string) {
  try {
    await prisma.task.delete({
      where: { id },
    });
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    console.error('Failed to delete task:', error);
    return { success: false, error: error.message || 'Failed to delete task' };
  }
}

export async function toggleTaskStatus(id: string, currentStatus: string) {
  try {
    const newStatus = currentStatus === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    const task = await prisma.task.update({
      where: { id },
      data: { status: newStatus },
    });
    revalidatePath('/');
    return { success: true, data: task };
  } catch (error: any) {
    console.error('Failed to toggle task status:', error);
    return { success: false, error: error.message || 'Failed to toggle task status' };
  }
}