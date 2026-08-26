const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const JobApplication = require('../models/JobApplication');
const DailyTask = require('../models/DailyTask');
const DailyLog = require('../models/DailyLog');

// GET /api/dashboard - Aggregated summary counts
router.get('/', async (req, res, next) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const threeDaysLaterStr = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Daily Tasks stats
    const dailyTotal = await DailyTask.countDocuments({ is_active: true });
    const dailyCompleted = await DailyLog.countDocuments({ log_date: todayStr, completed: true });
    const dailyPercentage = dailyTotal > 0 ? Math.round((dailyCompleted / dailyTotal) * 100) : 0;

    // Tasks stats
    const taskTotal = await Task.countDocuments();
    const taskPending = await Task.countDocuments({ status: 'Pending' });
    const taskCompleted = await Task.countDocuments({ status: 'Completed' });
    const taskDueSoon = await Task.countDocuments({
      status: 'Pending',
      due_date: { $gte: todayStr, $lte: threeDaysLaterStr, $ne: '' }
    });

    // Applications stats
    const appTotal = await JobApplication.countDocuments();
    const appActive = await JobApplication.countDocuments({
      status: { $in: ['Interested', 'Applied', 'Assessment', 'Interview'] }
    });
    const appInterviews = await JobApplication.countDocuments({ status: 'Interview' });
    const appSelected = await JobApplication.countDocuments({ status: 'Selected' });
    const appRejected = await JobApplication.countDocuments({ status: 'Rejected' });

    // Recent items
    const recentTasks = await Task.find({ status: 'Pending' })
      .sort({ due_date: 1 })
      .limit(5);

    const recentApplications = await JobApplication.find()
      .sort({ updated_at: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        daily: {
          total: dailyTotal,
          completed: dailyCompleted,
          percentage: dailyPercentage
        },
        tasks: {
          total: taskTotal,
          pending: taskPending,
          completed: taskCompleted,
          due_soon: taskDueSoon,
          recent: recentTasks
        },
        applications: {
          total: appTotal,
          active: appActive,
          interviews: appInterviews,
          selected: appSelected,
          rejected: appRejected,
          recent: recentApplications
        }
      }
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
