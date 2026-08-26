const express = require('express');
const cors = require('cors');
const path = require('path');

// Initialize MongoDB connection
const { connectDB } = require('./db');

const tasksRouter = require('./routes/tasks');
const applicationsRouter = require('./routes/applications');
const dashboardRouter = require('./routes/dashboard');
const dailyTasksRouter = require('./routes/dailyTasks');

const app = express();
const PORT = process.env.PORT || 5001;

// Connect Database
connectDB();

// Enable CORS for frontend integration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Log incoming requests
app.use((req, res, next) => {
  console.log(`[API] ${req.method} ${req.url}`);
  next();
});

// API Routes
app.use('/api/tasks', tasksRouter);
app.use('/api/applications', applicationsRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/daily-tasks', dailyTasksRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    database: 'connected (MongoDB persistent)'
  });
});

// 404 handler for unknown API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, error: 'API Endpoint Not Found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Error]', err.stack || err.message || err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`Trackly Backend Server running on http://localhost:${PORT}`);
  console.log(`Database Engine: MongoDB (Mongoose)`);
  console.log(`====================================================`);
});
