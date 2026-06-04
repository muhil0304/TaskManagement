const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
const dbPath = path.resolve(__dirname, 'tasks.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
    db.run(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'To Do',
        priority TEXT DEFAULT 'Medium',
        due_date TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }
});

// API Endpoints

// GET /api/tasks - Retrieve all tasks
app.get('/api/tasks', (req, res) => {
  db.all('SELECT * FROM tasks ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// POST /api/tasks - Create a new task
app.post('/api/tasks', (req, res) => {
  const { title, description, status, priority, due_date } = req.body;
  
  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required' });
  }

  const taskStatus = status || 'To Do';
  const taskPriority = priority || 'Medium';
  const taskDesc = description || '';
  const taskDueDate = due_date || '';

  const sql = `INSERT INTO tasks (title, description, status, priority, due_date) VALUES (?, ?, ?, ?, ?)`;
  const params = [title, taskDesc, taskStatus, taskPriority, taskDueDate];

  db.run(sql, params, function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    // Retrieve the newly created task
    db.get('SELECT * FROM tasks WHERE id = ?', [this.lastID], (err, row) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.status(201).json(row);
    });
  });
});

// PUT /api/tasks/:id - Update a task
app.put('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  const { title, description, status, priority, due_date } = req.body;

  // Check if task exists
  db.get('SELECT * FROM tasks WHERE id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const updatedTitle = title !== undefined ? title : row.title;
    const updatedDesc = description !== undefined ? description : row.description;
    const updatedStatus = status !== undefined ? status : row.status;
    const updatedPriority = priority !== undefined ? priority : row.priority;
    const updatedDueDate = due_date !== undefined ? due_date : row.due_date;

    if (!updatedTitle || updatedTitle.trim() === '') {
      return res.status(400).json({ error: 'Title cannot be empty' });
    }

    const sql = `
      UPDATE tasks 
      SET title = ?, description = ?, status = ?, priority = ?, due_date = ?
      WHERE id = ?
    `;
    const params = [updatedTitle, updatedDesc, updatedStatus, updatedPriority, updatedDueDate, id];

    db.run(sql, params, function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      db.get('SELECT * FROM tasks WHERE id = ?', [id], (err, updatedRow) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json(updatedRow);
      });
    });
  });
});

// DELETE /api/tasks/:id - Delete a task
app.delete('/api/tasks/:id', (req, res) => {
  const { id } = req.params;

  db.get('SELECT * FROM tasks WHERE id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Task not found' });
    }

    db.run('DELETE FROM tasks WHERE id = ?', [id], function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ message: 'Task deleted successfully', id: parseInt(id) });
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});