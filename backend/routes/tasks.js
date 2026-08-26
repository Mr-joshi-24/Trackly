const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Task = require('../models/Task');

// Helper to find by _id or sqlite_id
async function findTaskById(id) {
  if (mongoose.Types.ObjectId.isValid(id)) {
    const doc = await Task.findById(id);
    if (doc) return doc;
  }
  if (!isNaN(id)) {
    return await Task.findOne({ sqlite_id: Number(id) });
  }
  return null;
}

// GET /api/tasks - View all tasks with optional filtering and sorting
router.get('/', async (req, res, next) => {
  try {
    const { status, priority, sortBy, sortOrder } = req.query;

    const filter = {};
    if (status && status !== 'All') filter.status = status;
    if (priority && priority !== 'All') filter.priority = priority;

    let query = Task.find(filter);

    if (sortBy === 'due_date') {
      const dir = sortOrder === 'desc' ? -1 : 1;
      query = query.sort({ due_date: dir });
    } else if (sortBy === 'priority') {
      query = query.sort({ priority: sortOrder === 'desc' ? -1 : 1 });
    } else {
      query = query.sort({ created_at: -1 });
    }

    const tasks = await query.exec();
    res.json({ success: true, data: tasks });
  } catch (err) {
    next(err);
  }
});

// GET /api/tasks/:id - View single task
router.get('/:id', async (req, res, next) => {
  try {
    const task = await findTaskById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }
    res.json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
});

// POST /api/tasks - Create task
router.post('/', async (req, res, next) => {
  try {
    const { title, description = '', due_date = '', priority = 'Medium', status = 'Pending', category = 'General' } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, error: 'Task title is required' });
    }

    const newTask = await Task.create({
      title: title.trim(),
      description: description.trim(),
      due_date: due_date.trim(),
      priority,
      status,
      category: category.trim()
    });

    res.status(201).json({ success: true, data: newTask });
  } catch (err) {
    next(err);
  }
});

// PUT /api/tasks/:id - Edit task
router.put('/:id', async (req, res, next) => {
  try {
    const { title, description = '', due_date = '', priority = 'Medium', status = 'Pending', category = 'General' } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, error: 'Task title is required' });
    }

    const task = await findTaskById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    task.title = title.trim();
    task.description = description.trim();
    task.due_date = due_date.trim();
    task.priority = priority;
    task.status = status;
    task.category = category.trim();
    task.updated_at = new Date();

    await task.save();
    res.json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/tasks/:id/toggle - Toggle status
router.patch('/:id/toggle', async (req, res, next) => {
  try {
    const task = await findTaskById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    task.status = task.status === 'Completed' ? 'Pending' : 'Completed';
    task.updated_at = new Date();
    await task.save();

    res.json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/tasks/:id - Delete task
router.delete('/:id', async (req, res, next) => {
  try {
    const task = await findTaskById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    await Task.deleteOne({ _id: task._id });
    res.json({ success: true, message: 'Task deleted successfully', id: req.params.id });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
