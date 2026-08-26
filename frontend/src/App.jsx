import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import DailyTasksView from './components/DailyTasksView';
import TasksView from './components/TasksView';
import ApplicationsView from './components/ApplicationsView';
import Toast from './components/Toast';
import { api } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [theme, setTheme] = useState(() => localStorage.getItem('trackly_theme') || 'dark');

  // Application Data States
  const [dashboardStats, setDashboardStats] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Toast state
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Sync theme attribute to HTML document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('trackly_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Fetch all initial data from backend API
  const refreshAllData = useCallback(async () => {
    try {
      setLoading(true);
      const [dashRes, taskRes, appRes] = await Promise.all([
        api.fetchDashboard(),
        api.fetchTasks(),
        api.fetchApplications()
      ]);

      setDashboardStats(dashRes.data);
      setTasks(taskRes.data);
      setApplications(appRes.data);
    } catch (err) {
      console.error('Failed to load application data:', err);
      addToast(err.message || 'Failed to connect to backend server', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  // Daily Tasks Operations
  const handleCreateDailyTask = async (taskData) => {
    try {
      await api.createDailyTask(taskData);
      addToast('New daily routine task added!');
      await refreshAllData();
    } catch (err) {
      addToast(err.message || 'Failed to add daily task', 'error');
      throw err;
    }
  };

  const handleUpdateDailyTask = async (id, taskData) => {
    try {
      await api.updateDailyTask(id, taskData);
      addToast('Daily routine task updated!');
      await refreshAllData();
    } catch (err) {
      addToast(err.message || 'Failed to update daily task', 'error');
      throw err;
    }
  };

  const handleDeleteDailyTask = async (id) => {
    try {
      await api.deleteDailyTask(id);
      addToast('Daily routine task removed!');
      await refreshAllData();
    } catch (err) {
      addToast(err.message || 'Failed to delete daily task', 'error');
      throw err;
    }
  };

  // Long-Term Tasks Operations
  const handleCreateTask = async (taskData) => {
    try {
      await api.createTask(taskData);
      addToast('Task created successfully!');
      await refreshAllData();
    } catch (err) {
      addToast(err.message || 'Failed to create task', 'error');
    }
  };

  const handleUpdateTask = async (id, taskData) => {
    try {
      await api.updateTask(id, taskData);
      addToast('Task updated successfully!');
      await refreshAllData();
    } catch (err) {
      addToast(err.message || 'Failed to update task', 'error');
    }
  };

  const handleToggleTask = async (id) => {
    try {
      await api.toggleTask(id);
      addToast('Task status updated!');
      await refreshAllData();
    } catch (err) {
      addToast(err.message || 'Failed to toggle task status', 'error');
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await api.deleteTask(id);
      addToast('Task deleted!');
      await refreshAllData();
    } catch (err) {
      addToast(err.message || 'Failed to delete task', 'error');
    }
  };

  // Applications Operations
  const handleCreateApp = async (appData) => {
    try {
      await api.createApplication(appData);
      addToast('Job application added!');
      await refreshAllData();
    } catch (err) {
      addToast(err.message || 'Failed to create job application', 'error');
    }
  };

  const handleUpdateApp = async (id, appData) => {
    try {
      await api.updateApplication(id, appData);
      addToast('Job application updated!');
      await refreshAllData();
    } catch (err) {
      addToast(err.message || 'Failed to update application', 'error');
    }
  };

  const handleDeleteApp = async (id) => {
    try {
      await api.deleteApplication(id);
      addToast('Job application removed!');
      await refreshAllData();
    } catch (err) {
      addToast(err.message || 'Failed to delete application', 'error');
    }
  };

  return (
    <div className="app-container">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      <main className="main-content">
        {activeTab === 'dashboard' && (
          <DashboardView
            stats={dashboardStats}
            loading={loading}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'daily' && (
          <DailyTasksView
            onCreateDailyTask={handleCreateDailyTask}
            onUpdateDailyTask={handleUpdateDailyTask}
            onDeleteDailyTask={handleDeleteDailyTask}
            addToast={addToast}
          />
        )}

        {activeTab === 'tasks' && (
          <TasksView
            tasks={tasks}
            loading={loading}
            onCreateTask={handleCreateTask}
            onUpdateTask={handleUpdateTask}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
          />
        )}

        {activeTab === 'applications' && (
          <ApplicationsView
            applications={applications}
            loading={loading}
            onCreateApp={handleCreateApp}
            onUpdateApp={handleUpdateApp}
            onDeleteApp={handleDeleteApp}
          />
        )}
      </main>

      <Toast toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
