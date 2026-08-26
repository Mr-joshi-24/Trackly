# ⚡ Trackly (MERN Stack)

> **A Full-Stack MERN Application for Daily Routines, Long-Term Tasks & Job Application CRM**

Trackly is a modern, production-ready **MERN stack** productivity suite. It enables users to track daily habit routines with visual consistency grids, manage complex project tasks with priorities, and organize job application pipelines—all in a unified, lightning-fast dashboard.

---

## 🛠️ The MERN Architecture

```
  ┌────────────────────────────────────────────────────────┐
  │                   REACT 18 (Vite SPA)                  │
  │    Frontend UI with Custom CSS, Icons, & Dark Mode     │
  └───────────────────────────┬────────────────────────────┘
                              │ REST API (JSON)
                              ▼
  ┌────────────────────────────────────────────────────────┐
  │                   EXPRESS.JS + NODE.JS                 │
  │     Backend Server Routes, Middleware, & Controllers   │
  └───────────────────────────┬────────────────────────────┘
                              │ Mongoose ORM
                              ▼
  ┌────────────────────────────────────────────────────────┐
  │                    MONGODB DATABASE                    │
  │       Document Collections: Tasks, Apps, Habits, Logs  │
  └───────────────────────────┬────────────────────────────┘
```

| Component | Technology | Role |
|---|---|---|
| **M - Database** | **MongoDB & Mongoose** | Persistent document store for habits, logs, tasks, & job applications |
| **E - Backend API** | **Express.js** | Modular RESTful API handling business logic and filtering |
| **R - Frontend** | **React 18 & Vite** | Interactive UI with real-time feedback, state management, & dark theme |
| **N - Server Environment** | **Node.js** | Asynchronous JavaScript backend execution engine |

---

## ✨ Core Features

### 📅 1. Daily Task & Habit Tracker
- **Master Routine Management**: Define daily habit goals (e.g., Code DSA, Exercise, Reading).
- **Normalized Date Completion Logs**: Track completions across any date (past, present, or future).
- **7-Day Visual Consistency Grid**: Monitor weekly habit streaks and completion rates.

### 📋 2. Long-Term Task Manager
- **Priority Categorization**: Color-coded `High`, `Medium`, or `Low` priority badges.
- **Status Lifecycle**: `Pending` ➔ `In Progress` ➔ `Completed`.
- **Search & Filter**: Instant filtering by status, priority level, or custom category.

### 💼 3. Job Application Tracker (CRM)
- **Job Search Pipeline**: Track target companies, position titles, salary estimates, and job URLs.
- **Status Stages**: `Applied` ➔ `Assessment` ➔ `Interview` ➔ `Selected` / `Rejected`.
- **Follow-up Reminders**: Record notes, recruiter contacts, and scheduled interview dates.

### 📊 4. Central Analytics Dashboard
- Aggregated real-time metrics: Today's Habit Completion %, Pending Tasks due soon, and Active Job Interviews.

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** (v18+)
- **MongoDB** (Local instance running on `mongodb://127.0.0.1:27017` OR a **MongoDB Atlas** connection string)

---

### 1. Clone the Repository
```bash
git clone https://github.com/Mr-joshi-24/Trackly.git
cd Trackly
```

### 2. Backend Setup (Node + Express + MongoDB)
```bash
cd backend
npm install
```

*(Optional)* Configure custom MongoDB Connection URI:
```bash
# Set environment variable (e.g. MongoDB Atlas cloud URL)
export MONGODB_URI="mongodb+srv://user:pass@cluster.mongodb.net/trackly"
```

Start backend server:
```bash
npm start
```
*Backend runs on `http://localhost:5001` and connects to MongoDB.*

---

### 3. Frontend Setup (React + Vite)
In a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`.*

---

## 📁 Repository Structure

```
Trackly/
├── backend/
│   ├── models/          # Mongoose Schemas (Task, JobApplication, DailyTask, DailyLog)
│   ├── routes/          # Express API Endpoints (/tasks, /applications, /daily-tasks, /dashboard)
│   ├── scripts/         # Automated database utilities (migrate-to-mongo.js)
│   ├── db.js            # Mongoose MongoDB connection helper
│   └── server.js        # Express app entry point
├── frontend/
│   ├── src/
│   │   ├── components/  # React components (DailyTasksView, TasksView, ApplicationsView, DashboardView)
│   │   ├── services/    # Frontend API integration service layer
│   │   ├── App.jsx      # React main container & tab routing
│   │   └── index.css    # Custom design system (Dark mode, glassmorphism, responsive layout)
│   └── vite.config.js   # Vite configuration
└── decisions.md         # Architecture & technical decisions document
```

---

## 📝 License
Distributed under the [MIT License](LICENSE).
