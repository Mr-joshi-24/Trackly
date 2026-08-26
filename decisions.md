# Technical Decisions & Architectural Documentation

This document records all key architectural decisions, library selections, data persistence strategies, entry point execution orders, and function call chains for **Trackly** (Daily Tasks Tracker + Long-Term Task Manager + Job Application Tracker).

---

## 1. Architectural Strategy & Technical Stack

### 1.1 Backend: Node.js + Express + `mongoose` (MongoDB)
- **Decision**: Use Node.js with Express and `mongoose` (MongoDB).
- **Rationale**:
  - **Scalable Document Storage**: MongoDB documents map naturally to JSON schemas for tasks, job applications, daily routines, and daily completion logs.
  - **Zero Data Loss Guarantee**: An automated migration script (`backend/scripts/migrate-to-mongo.js`) safely transferred all pre-existing records from SQLite (`trackly.db`) to MongoDB collections.
  - **High Performance & Flexibility**: Provides index-backed fast queries, compound unique index on `(daily_task_id, log_date)`, and flexible schema updates.
  - **Environment Configuration**: Default local connection `mongodb://127.0.0.1:27017/trackly` with support for cloud MongoDB Atlas via `MONGODB_URI`.

### 1.2 Frontend: React 18 + Vite + Lucide Icons + Pure CSS System
- **Decision**: Vite + React SPA with standard CSS variables and zero external UI component frameworks.
- **Rationale**:
  - **Performance & Reliability**: Vite provides instant HMR and build speeds.
  - **Clean Aesthetics**: Custom vanilla CSS design system ensures complete control over styling (glassmorphism, vibrant dark/light modes, micro-interactions, responsive sidebars) without utility bloat.
  - **Lucide Icons**: Crisp visual cues for status badges, priority levels, actions, daily streak flame icons, and sidebar navigation.

---

## 2. Daily Tasks & Movement Tracker Architecture

### 2.1 Schema Rationale (Normalized Daily Logs)
- **`daily_tasks`**: Master table of recurring daily routines (e.g. "LeetCode 1 Problem", "30 Min Exercise"). Stores title, category, and `is_active` status.
- **`daily_logs`**: Execution record table linking `daily_task_id` and `log_date` (`YYYY-MM-DD`).
- **Why this normalized approach?**:
  - Allows user to create a master routine once and track completion across any date (past, present, or future) independently.
  - Keeps historical data pristine: checking a task today does not alter yesterday's record.
  - Enables fast aggregate queries for 7-day movement trends and completion statistics.

```sql
CREATE TABLE IF NOT EXISTS daily_tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  category TEXT DEFAULT 'General',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_active INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS daily_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  daily_task_id INTEGER NOT NULL,
  log_date TEXT NOT NULL,
  completed INTEGER DEFAULT 0,
  notes TEXT DEFAULT '',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (daily_task_id) REFERENCES daily_tasks(id) ON DELETE CASCADE,
  UNIQUE(daily_task_id, log_date)
);
```

---

## 3. Execution Flow & Entry Point Sequence

### 3.1 Backend Startup Execution Sequence

```
[Start Command: node server.js]
        │
        ▼
1. server.js executes imports & environment configuration
        │
        ▼
2. db.js is imported & initialized
   ├── Checks if 'backend/data/' directory exists. If missing, creates directory synchronously.
   ├── Opens SQLite connection to persistent file 'backend/data/trackly.db'.
   └── Executes SQL schema setup:
       ├── CREATE TABLE IF NOT EXISTS tasks (...)
       ├── CREATE TABLE IF NOT EXISTS job_applications (...)
       ├── CREATE TABLE IF NOT EXISTS daily_tasks (...)
       └── CREATE TABLE IF NOT EXISTS daily_logs (...)
        │
        ▼
3. Express Application Setup
   ├── Middleware registered: cors(), express.json()
   └── Routes mounted:
       ├── /api/tasks ──> routes/tasks.js
       ├── /api/applications ──> routes/applications.js
       ├── /api/daily-tasks ──> routes/dailyTasks.js
       └── /api/dashboard ──> routes/dashboard.js
        │
        ▼
4. Express Server begins listening on PORT 5001
```

### 3.2 Frontend Startup & Render Execution Sequence

```
[Browser Navigates to Frontend URL]
        │
        ▼
1. index.html loads entry point src/main.jsx
        │
        ▼
2. main.jsx renders <App /> inside React root
        │
        ▼
3. App.jsx mounts & initializes state:
   ├── currentTab ('dashboard' | 'daily' | 'tasks' | 'applications')
   ├── theme ('dark' | 'light')
   ├── dashboardStats, dailyTasks, tasks, applications, loading, toast state
        │
        ▼
4. useEffect triggers initial data fetch:
   ├── api.fetchDashboard()   ──> GET /api/dashboard
   ├── api.fetchDailyTasks()  ──> GET /api/daily-tasks?date=YYYY-MM-DD
   ├── api.fetchTasks()       ──> GET /api/tasks
   └── api.fetchApplications() ──> GET /api/applications
        │
        ▼
5. Components render based on active currentTab:
   ├── Sidebar (Navigation & Persistent Status)
   ├── DashboardView (Metric Cards & Quick Summary)
   ├── DailyTasksView (Date Navigation, Daily Checklist, 7-Day Grid, Modals)
   ├── TasksView (Filters, Task Table/Cards, Edit/Delete Modals)
   └── ApplicationsView (Search, Filters, Job Table, Edit/Delete Modals)
```

---

## 4. Detailed API & Function Call Graph

### 4.1 Daily Task Operations Flow

1. **User Toggles Daily Task Completion for Selected Date**:
   - `DailyTasksView.jsx`: Click checkbox triggers `handleToggle(taskId)`.
   - Calls `api.toggleDailyTask(taskId, selectedDate)`.
   - Backend `routes/dailyTasks.js`: Executes `INSERT INTO daily_logs (daily_task_id, log_date, completed) VALUES (?, ?, 1) ON CONFLICT(daily_task_id, log_date) DO UPDATE SET completed = 1 - completed`.
   - SQLite writes row to `trackly.db`.
   - Frontend receives updated list & updates state seamlessly.

2. **User Navigates Date (e.g. Yesterday / Tomorrow)**:
   - `DailyTasksView.jsx`: Click date button updates `selectedDate`.
   - Triggers `api.fetchDailyTasks(newDate)`.
   - Backend fetches daily task definitions LEFT JOINed with `daily_logs` for `newDate`.
   - Returns date-specific completion state.

---

## 5. Data Safety & Non-Destructive Guarantees

- **No Schema Drops**: The database initialization SQL scripts strictly use `CREATE TABLE IF NOT EXISTS`.
- **No Overwrite on Startup**: Opening `backend/data/trackly.db` reuses existing SQLite header and B-tree tables.
- **Parametrized Queries**: All SQL commands use binding parameters (`?`) to prevent SQL injection vulnerabilities.
- **Fail-Safe Fallbacks**: Frontend displays clean error toasts if network connection fails.
