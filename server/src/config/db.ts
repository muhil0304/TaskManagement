import fs from 'fs';
import path from 'path';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface DatabaseSchema {
  users: User[];
  tasks: Task[];
}

export class Database {
  private filePath: string;
  private writeQueue: Promise<void> = Promise.resolve();

  constructor(filePath?: string) {
    const defaultPath = path.join(__dirname, '../../data/db.json');
    this.filePath = filePath || process.env.DB_FILE_PATH || defaultPath;
    this.ensureDirectoryExists();
    this.initializeDatabase();
  }

  private ensureDirectoryExists() {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  private initializeDatabase() {
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(
        this.filePath,
        JSON.stringify({ users: [], tasks: [] }, null, 2),
        'utf-8'
      );
    }
  }

  public async read(): Promise<DatabaseSchema> {
    try {
      const data = await fs.promises.readFile(this.filePath, 'utf-8');
      return JSON.parse(data) as DatabaseSchema;
    } catch (error) {
      // Fallback if file is corrupted or empty
      return { users: [], tasks: [] };
    }
  }

  public async write(data: DatabaseSchema): Promise<void> {
    // Queue writes to prevent race conditions and file corruption
    return new Promise<void>((resolve, reject) => {
      this.writeQueue = this.writeQueue.then(async () => {
        const tempPath = `${this.filePath}.tmp`;
        try {
          await fs.promises.writeFile(tempPath, JSON.stringify(data, null, 2), 'utf-8');
          await fs.promises.rename(tempPath, this.filePath);
          resolve();
        } catch (error) {
          if (fs.existsSync(tempPath)) {
            try {
              fs.unlinkSync(tempPath);
            } catch (_) {}
          }
          reject(error);
        }
      });
    });
  }

  // User operations
  public async getUsers(): Promise<User[]> {
    const db = await this.read();
    return db.users;
  }

  public async getUserByEmail(email: string): Promise<User | undefined> {
    const users = await this.getUsers();
    return users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public async getUserById(id: string): Promise<User | undefined> {
    const users = await this.getUsers();
    return users.find(u => u.id === id);
  }

  public async createUser(user: Omit<User, 'createdAt'>): Promise<User> {
    const db = await this.read();
    const newUser: User = {
      ...user,
      createdAt: new Date().toISOString()
    };
    db.users.push(newUser);
    await this.write(db);
    return newUser;
  }

  // Task operations
  public async getTasks(userId: string): Promise<Task[]> {
    const db = await this.read();
    return db.tasks.filter(t => t.userId === userId);
  }

  public async getTaskById(id: string, userId: string): Promise<Task | undefined> {
    const db = await this.read();
    return db.tasks.find(t => t.id === id && t.userId === userId);
  }

  public async createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    const db = await this.read();
    const newTask: Task = {
      ...task,
      id: Math.random().toString(36).substring(2, 15),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.tasks.push(newTask);
    await this.write(db);
    return newTask;
  }

  public async updateTask(
    id: string,
    userId: string,
    updates: Partial<Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
  ): Promise<Task | null> {
    const db = await this.read();
    const index = db.tasks.findIndex(t => t.id === id && t.userId === userId);
    if (index === -1) return null;

    const updatedTask: Task = {
      ...db.tasks[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    db.tasks[index] = updatedTask;
    await this.write(db);
    return updatedTask;
  }

  public async deleteTask(id: string, userId: string): Promise<boolean> {
    const db = await this.read();
    const initialLength = db.tasks.length;
    db.tasks = db.tasks.filter(t => !(t.id === id && t.userId === userId));
    if (db.tasks.length === initialLength) return false;
    await this.write(db);
    return true;
  }
}

export const db = new Database();