const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const DailyTask = require('../models/DailyTask');
const DailyLog = require('../models/DailyLog');

async function findDailyTaskById(id) {
  if (mongoose.Types.ObjectId.isValid(id)) {
    const doc = await DailyTask.findById(id);
    if (doc) return doc;
  }
  if (!isNaN(id)) {
    return await DailyTask.findOne({ sqlite_id: Number(id) });
  }
  return null;
}

// GET /api/daily-tasks?date=YYYY-MM-DD - Fetch daily tasks merged with logs for date
router.get('/', async (req, res, next) => {
  try {
    const logDate = req.query.date || new Date().toISOString().split('T')[0];

    const activeTasks = await DailyTask.find({ is_active: true }).sort({ created_at: 1 });
    const logs = await DailyLog.find({ log_date: logDate });

    const logMap = new Map();
    logs.forEach(l => logMap.set(l.daily_task_id.toString(), l));

    const mergedData = activeTasks.map(task => {
      const log = logMap.get(task._id.toString());
      return {
        id: task._id,
        sqlite_id: task.sqlite_id,
        title: task.title,
        category: task.category,
        is_active: task.is_active,
        completed: log ? (log.completed ? 1 : 0) : 0,
        notes: log ? log.notes : '',
        log_id: log ? log._id : null
      };
    });

    res.json({ success: true, date: logDate, data: mergedData });
  } catch (err) {
    next(err);
  }
});

// POST /api/daily-tasks - Create new master daily task
router.post('/', async (req, res, next) => {
  try {
    const { title, category = 'General' } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, error: 'Daily task title is required' });
    }

    const newTask = await DailyTask.create({
      title: title.trim(),
      category: category.trim(),
      is_active: true
    });

    res.status(201).json({ success: true, data: newTask });
  } catch (err) {
    next(err);
  }
});

// PUT /api/daily-tasks/:id - Edit master daily task
router.put('/:id', async (req, res, next) => {
  try {
    const { title, category = 'General' } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, error: 'Daily task title is required' });
    }

    const task = await findDailyTaskById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, error: 'Daily task not found' });
    }

    task.title = title.trim();
    task.category = category.trim();
    await task.save();

    res.json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/daily-tasks/:id - Delete daily task
router.delete('/:id', async (req, res, next) => {
  try {
    const task = await findDailyTaskById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, error: 'Daily task not found' });
    }

    await DailyLog.deleteMany({ daily_task_id: task._id });
    await DailyTask.deleteOne({ _id: task._id });

    res.json({ success: true, message: 'Daily task deleted successfully', id: req.params.id });
  } catch (err) {
    next(err);
  }
});

// POST /api/daily-tasks/toggle - Toggle completion status for date
router.post('/toggle', async (req, res, next) => {
  try {
    const { daily_task_id, date } = req.body;

    if (!daily_task_id) {
      return res.status(400).json({ success: false, error: 'daily_task_id is required' });
    }

    const task = await findDailyTaskById(daily_task_id);
    if (!task) {
      return res.status(404).json({ success: false, error: 'Daily task not found' });
    }

    const logDate = date || new Date().toISOString().split('T')[0];

    let log = await DailyLog.findOne({ daily_task_id: task._id, log_date: logDate });

    if (log) {
      log.completed = !log.completed;
      await log.save();
    } else {
      log = await DailyLog.create({
        daily_task_id: task._id,
        log_date: logDate,
        completed: true
      });
    }

    res.json({ success: true, message: 'Status toggled successfully', daily_task_id: task._id, date: logDate });
  } catch (err) {
    next(err);
  }
});

// GET /api/daily-tasks/history - Get 7-day movement history
router.get('/history', async (req, res, next) => {
  try {
    const historyDays = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      historyDays.push(d.toISOString().split('T')[0]);
    }

    const totalActiveCount = await DailyTask.countDocuments({ is_active: true });

    const historyData = await Promise.all(
      historyDays.map(async (dateStr) => {
        const completedLogsCount = await DailyLog.countDocuments({
          log_date: dateStr,
          completed: true
        });

        return {
          date: dateStr,
          completed: completedLogsCount,
          total: totalActiveCount
        };
      })
    );

    res.json({ success: true, data: historyData });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
