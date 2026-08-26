// Centralized API client for Trackly

const API_BASE = '/api';

async function handleResponse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.success === false) {
    const errorMsg = data.error || `HTTP error ${res.status}`;
    throw new Error(errorMsg);
  }
  return data;
}

export const api = {
  // Health
  checkHealth: async () => {
    const res = await fetch(`${API_BASE}/health`);
    return handleResponse(res);
  },

  // Dashboard
  fetchDashboard: async () => {
    const res = await fetch(`${API_BASE}/dashboard`);
    return handleResponse(res);
  },

  // Daily Tasks
  fetchDailyTasks: async (dateStr) => {
    const query = dateStr ? `?date=${encodeURIComponent(dateStr)}` : '';
    const res = await fetch(`${API_BASE}/daily-tasks${query}`);
    return handleResponse(res);
  },

  createDailyTask: async (taskData) => {
    const res = await fetch(`${API_BASE}/daily-tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData)
    });
    return handleResponse(res);
  },

  updateDailyTask: async (id, taskData) => {
    const res = await fetch(`${API_BASE}/daily-tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData)
    });
    return handleResponse(res);
  },

  toggleDailyTask: async (dailyTaskId, dateStr) => {
    const res = await fetch(`${API_BASE}/daily-tasks/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ daily_task_id: dailyTaskId, date: dateStr })
    });
    return handleResponse(res);
  },

  deleteDailyTask: async (id) => {
    const res = await fetch(`${API_BASE}/daily-tasks/${id}`, {
      method: 'DELETE'
    });
    return handleResponse(res);
  },

  fetchDailyHistory: async () => {
    const res = await fetch(`${API_BASE}/daily-tasks/history`);
    return handleResponse(res);
  },

  // Long-Term Tasks
  fetchTasks: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.status && params.status !== 'All') query.append('status', params.status);
    if (params.priority && params.priority !== 'All') query.append('priority', params.priority);
    if (params.sortBy) query.append('sortBy', params.sortBy);
    if (params.sortOrder) query.append('sortOrder', params.sortOrder);

    const url = `${API_BASE}/tasks?${query.toString()}`;
    const res = await fetch(url);
    return handleResponse(res);
  },

  createTask: async (taskData) => {
    const res = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData)
    });
    return handleResponse(res);
  },

  updateTask: async (id, taskData) => {
    const res = await fetch(`${API_BASE}/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData)
    });
    return handleResponse(res);
  },

  toggleTask: async (id) => {
    const res = await fetch(`${API_BASE}/tasks/${id}/toggle`, {
      method: 'PATCH'
    });
    return handleResponse(res);
  },

  deleteTask: async (id) => {
    const res = await fetch(`${API_BASE}/tasks/${id}`, {
      method: 'DELETE'
    });
    return handleResponse(res);
  },

  // Job Applications
  fetchApplications: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.status && params.status !== 'All') query.append('status', params.status);
    if (params.search) query.append('search', params.search);

    const url = `${API_BASE}/applications?${query.toString()}`;
    const res = await fetch(url);
    return handleResponse(res);
  },

  createApplication: async (appData) => {
    const res = await fetch(`${API_BASE}/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(appData)
    });
    return handleResponse(res);
  },

  updateApplication: async (id, appData) => {
    const res = await fetch(`${API_BASE}/applications/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(appData)
    });
    return handleResponse(res);
  },

  deleteApplication: async (id) => {
    const res = await fetch(`${API_BASE}/applications/${id}`, {
      method: 'DELETE'
    });
    return handleResponse(res);
  }
};
