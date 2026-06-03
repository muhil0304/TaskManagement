import express, { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

const app = express();
app.use(express.json());

const validateBody = (schema: z.AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      res.status(400).json({ error });
    }
  };
};

const RegisterSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const dateSchema = z.string().refine((val) => !isNaN(Date.parse(val)), {
  message: "Invalid date format",
});

const TaskCreateSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  dueDate: dateSchema.optional(),
});

const TaskUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  dueDate: dateSchema.optional(),
  completed: z.boolean().optional(),
});

app.post('/api/auth/register', validateBody(RegisterSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    next(error);
  }
});

app.post('/api/auth/login', validateBody(LoginSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(200).json({ token: "dummy-token" });
  } catch (error) {
    next(error);
  }
});

app.post('/api/tasks', validateBody(TaskCreateSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(201).json({ message: "Task created" });
  } catch (error) {
    next(error);
  }
});

app.put('/api/tasks/:id', validateBody(TaskUpdateSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(200).json({ message: "Task updated" });
  } catch (error) {
    next(error);
  }
});

export default app;