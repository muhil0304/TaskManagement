const express = require('express');
const cors = require('cors');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// GET /api/tasks (with optional filtering by status)
app.get('/api/tasks', (req, res) => {
  const { status } = req.query;
  let query = 'SELECT * FROM tasks';
  const params = [];

  if (status && ['pending', 'completed'].includes(status)) {
    query += ' WHERE status = ?';
    params.push(status);
  }

  query += ' ORDER BY created_at DESC';

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// POST /api/tasks (validation for required fields)
app.post('/api/tasks', (req, res) => {
  const { title, description, priority, due_date } = req.body;

  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required' });
  }

  const taskPriority = priority || 'medium';
  const taskStatus = 'pending';

  const query = `INSERT INTO tasks (title, description, status, priority, due_date) VALUES (?, ?, ?, ?, ?)`;
  const params = [title.trim(), description || '', taskStatus, taskPriority, due_date || null];

  db.run(query, params, function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    // Fetch the newly created task
    db.get('SELECT * FROM tasks WHERE id = ?', [this.lastID], (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json(row);
    });
  });
});

// PUT /api/tasks/:id (update any field, including status)
app.put('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  const { title, description, status, priority, due_date } = req.body;

  // First check if task exists
  db.get('SELECT * FROM tasks WHERE id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const updatedTitle = title !== undefined ? title.trim() : row.title;
    const updatedDescription = description !== undefined ? description : row.description;
    const updatedStatus = status !== undefined ? status : row.status;
    const updatedPriority = priority !== undefined ? priority : row.priority;
    const updatedDueDate = due_date !== undefined ? due_date : row.due_date;

    if (updatedTitle === '') {
      return res.status(400).json({ error: 'Title cannot be empty' });
    }

    if (updatedStatus && !['pending', 'completed'].includes(updatedStatus)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    if (updatedPriority && !['low', 'medium', 'high'].includes(updatedPriority)) {
      return res.status(400).json({ error: 'Invalid priority value' });
    }

    const query = `UPDATE tasks SET title = ?, description = ?, status = ?, priority = ?, due_date = ? WHERE id = ?`;
    const params = [updatedTitle, updatedDescription, updatedStatus, updatedPriority, updatedDueDate, id];

    db.run(query, params, function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      db.get('SELECT * FROM tasks WHERE id = ?', [id], (err, updatedRow) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json(updatedRow);
      });
    });
  });
});

// DELETE /api/tasks/:id (delete task)
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
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: 'Task deleted successfully', id: parseInt(id) });
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});