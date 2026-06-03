import { Response } from 'express';
import { randomUUID } from 'crypto';
import { db } from '../config/db';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

const database = db as any;

export const getTasks = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!database.data) {
      database.data = { users: [], tasks: [] };
    }

    // Filter tasks belonging to the authenticated user
    let userTasks = database.data.tasks.filter((task: any) => task.userId === userId);

    // Apply filters
    const { status, priority, sortBy, order } = req.query;

    if (status) {
      userTasks = userTasks.filter(
        (task: any) => task.status.toLowerCase() === (status as string).toLowerCase()
      );
    }

    if (priority) {
      userTasks = userTasks.filter(
        (task: any) => task.priority.toLowerCase() === (priority as string).toLowerCase()
      );
    }

    // Apply sorting
    const sortOrder = order === 'desc' ? -1 : 1;

    if (sortBy === 'dueDate') {
      userTasks.sort((a: any, b: any) => {
        const dateA = new Date(a.dueDate).getTime();
        const dateB = new Date(b.dueDate).getTime();
        return (dateA - dateB) * sortOrder;
      });
    } else if (sortBy === 'priority') {
      const priorityWeight = { Low: 1, Medium: 2, High: 3 };
      userTasks.sort((a: any, b: any) => {
        const weightA = priorityWeight[a.priority as 'Low' | 'Medium' | 'High'] || 0;
        const weightB = priorityWeight[b.priority as 'Low' | 'Medium' | 'High'] || 0;
        return (weightA - weightB) * sortOrder;
      });
    } else {
      // Default sort by createdAt descending
      userTasks.sort((a: any, b: any) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA; // Newest first
      });
    }

    return res.status(200).json(userTasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    return res.status(500).json({ error: 'Internal server error fetching tasks' });
  }
};

export const getTaskById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!database.data) {
      database.data = { users: [], tasks: [] };
    }

    const task = database.data.tasks.find((t: any) => t.id === id);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (task.userId !== userId) {
      return res.status(403).json({ error: 'Access denied to this task' });
    }

    return res.status(200).json(task);
  } catch (error) {
    console.error('Get task by ID error:', error);
    return res.status(500).json({ error: 'Internal server error fetching task' });
  }
};

export const createTask = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!database.data) {
      database.data = { users: [], tasks: [] };
    }

    const { title, description, dueDate, priority, status } = req.body;

    const newTask = {
      id: randomUUID(),
      userId,
      title,
      description: description || '',
      dueDate,
      priority,
      status: status || 'Pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    database.data.tasks.push(newTask);
    await database.write();

    return res.status(201).json(newTask);
  } catch (error) {
    console.error('Create task error:', error);
    return res.status(500).json({ error: 'Internal server error creating task' });
  }
};

export const updateTask = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!database.data) {
      database.data = { users: [], tasks: [] };
    }

    const taskIndex = database.data.tasks.findIndex((t: any) => t.id === id);

    if (taskIndex === -1) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const task = database.data.tasks[taskIndex];

    if (task.userId !== userId) {
      return res.status(403).json({ error: 'Access denied to this task' });
    }

    const { title, description, dueDate, priority, status } = req.body;

    const updatedTask = {
      ...task,
      title: title !== undefined ? title : task.title,
      description: description !== undefined ? description : task.description,
      dueDate: dueDate !== undefined ? dueDate : task.dueDate,
      priority: priority !== undefined ? priority : task.priority,
      status: status !== undefined ? status : task.status,
      updatedAt: new Date().toISOString(),
    };

    database.data.tasks[taskIndex] = updatedTask;
    await database.write();

    return res.status(200).json(updatedTask);
  } catch (error) {
    console.error('Update task error:', error);
    return res.status(500).json({ error: 'Internal server error updating task' });
  }
};

export const deleteTask = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!database.data) {
      database.data = { users: [], tasks: [] };
    }

    const taskIndex = database.data.tasks.findIndex((t: any) => t.id === id);

    if (taskIndex === -1) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const task = database.data.tasks[taskIndex];

    if (task.userId !== userId) {
      return res.status(403).json({ error: 'Access denied to this task' });
    }

    database.data.tasks.splice(taskIndex, 1);
    await database.write();

    return res.status(200).json({ message: 'Task deleted successfully', id });
  } catch (error) {
    console.error('Delete task error:', error);
    return res.status(500).json({ error: 'Internal server error deleting task' });
  }
};