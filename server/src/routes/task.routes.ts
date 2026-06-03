import { Router } from 'express';
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} from '../controllers/task.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { z } from 'zod';

const router = Router();

const createTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required').max(100, 'Title is too long'),
    description: z.string().max(1000, 'Description is too long').optional().default(''),
    dueDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid due date format',
    }),
    priority: z.enum(['Low', 'Medium', 'High']),
    status: z.enum(['Pending', 'Completed']).optional().default('Pending'),
  }),
});

const updateTaskSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid task ID format'),
  }),
  body: z.object({
    title: z.string().min(1, 'Title is required').max(100, 'Title is too long').optional(),
    description: z.string().max(1000, 'Description is too long').optional(),
    dueDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid due date format',
    }).optional(),
    priority: z.enum(['Low', 'Medium', 'High']).optional(),
    status: z.enum(['Pending', 'Completed']).optional(),
  }),
});

const taskIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid task ID format'),
  }),
});

// Apply authentication to all task routes
router.use(authenticateToken as any);

router.get('/', getTasks as any);
router.get('/:id', validateRequest(taskIdSchema), getTaskById as any);
router.post('/', validateRequest(createTaskSchema), createTask as any);
router.put('/:id', validateRequest(updateTaskSchema), updateTask as any);
router.delete('/:id', validateRequest(taskIdSchema), deleteTask as any);

export default router;