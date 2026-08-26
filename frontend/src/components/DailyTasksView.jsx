import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  CheckSquare, 
  Square, 
  Trash2, 
  Edit2, 
  Flame,
  Activity,
  CheckCircle2
} from 'lucide-react';
import Modal from './Modal';
import { api } from '../services/api';

const CATEGORIES = ['General', 'Coding', 'Health', 'Career', 'Learning'];

export default function DailyTasksView({ onCreateDailyTask, onUpdateDailyTask, onDeleteDailyTask, addToast }) {
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [dailyTasks, setDailyTasks] = useState([]);
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deleteModalId, setDeleteModalId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({ title: '', category: 'General' });

  const fetchDailyData = async (dateStr) => {
    try {
      setLoading(true);
      const [tasksRes, histRes] = await Promise.all([
        api.fetchDailyTasks(dateStr),
        api.fetchDailyHistory()
      ]);
      setDailyTasks(tasksRes.data);
      setHistoryData(histRes.data);
    } catch (err) {
      console.error('Failed to fetch daily tasks:', err);
      if (addToast) addToast(err.message || 'Failed to load daily tasks', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDailyData(selectedDate);
  }, [selectedDate]);

  const handleDateChange = (offsetDays) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + offsetDays);
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  const handleToggle = async (taskId) => {
    try {
      await api.toggleDailyTask(taskId, selectedDate);
      await fetchDailyData(selectedDate);
    } catch (err) {
      if (addToast) addToast(err.message || 'Failed to toggle task', 'error');
    }
  };

  const openCreateModal = () => {
    setEditingTask(null);
    setFormData({ title: '', category: 'General' });
    setIsModalOpen(true);
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setFormData({ title: task.title, category: task.category || 'General' });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    try {
      if (editingTask) {
        await onUpdateDailyTask(editingTask.id, formData);
      } else {
        await onCreateDailyTask(formData);
      }
      setIsModalOpen(false);
      await fetchDailyData(selectedDate);
    } catch (err) {
      if (addToast) addToast(err.message || 'Failed to save daily task', 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (deleteModalId) {
      try {
        await onDeleteDailyTask(deleteModalId);
        setDeleteModalId(null);
        await fetchDailyData(selectedDate);
      } catch (err) {
        if (addToast) addToast(err.message || 'Failed to delete daily task', 'error');
      }
    }
  };

  const isToday = selectedDate === new Date().toISOString().split('T')[0];
  const completedCount = dailyTasks.filter((t) => t.completed === 1).length;
  const totalCount = dailyTasks.length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const filteredTasks = categoryFilter === 'All' 
    ? dailyTasks 
    : dailyTasks.filter((t) => t.category === categoryFilter);

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity color="var(--accent-primary)" size={28} /> Daily Tracker & Movements
          </h2>
          <p className="page-subtitle">Track your daily movements, habits, and recurring daily routines.</p>
        </div>
        <button className="btn-primary" onClick={openCreateModal}>
          <Plus size={18} /> Add Daily Routine
        </button>
      </div>

      {/* Date Switcher Bar */}
      <div className="toolbar" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button className="btn-secondary" onClick={() => handleDateChange(-1)}>
            <ChevronLeft size={18} /> Prev Day
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1.05rem' }}>
            <Calendar size={18} color="var(--accent-primary)" />
            <span>{selectedDate}</span>
            {isToday && (
              <span className="badge badge-applied" style={{ fontSize: '0.75rem' }}>Today</span>
            )}
          </div>
          <button className="btn-secondary" onClick={() => handleDateChange(1)}>
            Next Day <ChevronRight size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <input
            type="date"
            className="select-control"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
          {!isToday && (
            <button
              className="btn-secondary"
              onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
              style={{ fontSize: '0.82rem' }}
            >
              Jump to Today
            </button>
          )}
        </div>
      </div>

      {/* Daily Progress & Streak Summary Card */}
      <div className="metrics-grid" style={{ gridTemplateColumns: '2fr 1fr', marginBottom: '1.5rem' }}>
        <div className="metric-card">
          <div className="metric-header">
            <span>Daily Completion Progress ({selectedDate})</span>
            <span style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>{completionPercentage}%</span>
          </div>
          <div className="metric-value" style={{ fontSize: '1.75rem', marginTop: '0.5rem' }}>
            {completedCount} / {totalCount} Completed
          </div>
          <div style={{ 
            width: '100%', 
            height: '10px', 
            backgroundColor: 'rgba(255,255,255,0.08)', 
            borderRadius: '5px', 
            marginTop: '0.75rem',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${completionPercentage}%`,
              height: '100%',
              background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))',
              transition: 'width 0.4s ease'
            }} />
          </div>
        </div>

        <div className="metric-card" style={{ justifyContent: 'center' }}>
          <div className="metric-header">
            <span>7-Day Movement Streak</span>
            <Flame color="#f59e0b" size={20} />
          </div>
          <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.85rem', justifyContent: 'space-between' }}>
            {historyData.map((day) => {
              const dayPct = day.total > 0 ? (day.completed / day.total) : 0;
              const isFull = dayPct === 1 && day.total > 0;
              const isPartial = dayPct > 0 && !isFull;
              return (
                <div key={day.date} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem' }}>
                  <div 
                    title={`${day.date}: ${day.completed}/${day.total} done`}
                    style={{ 
                      width: '24px', 
                      height: '24px', 
                      borderRadius: '6px', 
                      backgroundColor: isFull ? '#10b981' : isPartial ? '#f59e0b' : 'rgba(255,255,255,0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontSize: '0.65rem',
                      fontWeight: 700
                    }}
                  >
                    {day.completed}
                  </div>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>
                    {day.date.split('-').slice(1).join('/')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Category Toolbar */}
      <div className="toolbar" style={{ padding: '0.75rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Category:</span>
          <button
            className={`btn-secondary ${categoryFilter === 'All' ? 'active' : ''}`}
            onClick={() => setCategoryFilter('All')}
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.82rem' }}
          >
            All ({dailyTasks.length})
          </button>
          {CATEGORIES.map((cat) => {
            const count = dailyTasks.filter((t) => t.category === cat).length;
            return (
              <button
                key={cat}
                className={`btn-secondary ${categoryFilter === cat ? 'active' : ''}`}
                onClick={() => setCategoryFilter(cat)}
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.82rem' }}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Daily Checklist Table */}
      {loading ? (
        <div className="empty-state">Loading daily routines...</div>
      ) : filteredTasks.length === 0 ? (
        <div className="table-container">
          <div className="empty-state">
            <CheckCircle2 size={36} className="empty-icon" />
            <div className="empty-title">No daily tasks defined</div>
            <p>Add recurring daily routines (e.g. "LeetCode 1 Problem", "Exercise") to track your movements.</p>
          </div>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>Done</th>
                <th>Daily Task Routine</th>
                <th>Category</th>
                <th>Status for {selectedDate}</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map((task) => {
                const isCompleted = task.completed === 1;
                return (
                  <tr key={task.id} style={{ opacity: isCompleted ? 0.75 : 1 }}>
                    <td>
                      <button
                        className="icon-btn"
                        onClick={() => handleToggle(task.id)}
                        title={isCompleted ? 'Mark as Incomplete' : 'Mark as Complete'}
                        style={{ color: isCompleted ? '#34d399' : 'var(--text-dim)' }}
                      >
                        {isCompleted ? <CheckSquare size={22} color="#34d399" /> : <Square size={22} />}
                      </button>
                    </td>
                    <td>
                      <div style={{ 
                        fontWeight: 600, 
                        fontSize: '0.95rem',
                        textDecoration: isCompleted ? 'line-through' : 'none',
                        color: isCompleted ? 'var(--text-muted)' : 'var(--text-main)'
                      }}>
                        {task.title}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-applied" style={{ fontSize: '0.78rem' }}>
                        {task.category || 'General'}
                      </span>
                    </td>
                    <td>
                      {isCompleted ? (
                        <span className="badge badge-completed">
                          <CheckCircle2 size={12} /> Completed
                        </span>
                      ) : (
                        <span className="badge badge-pending">
                          Pending Today
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="action-group" style={{ justifyContent: 'flex-end' }}>
                        <button
                          className="icon-btn"
                          onClick={() => openEditModal(task)}
                          title="Edit Routine"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          className="icon-btn danger"
                          onClick={() => setDeleteModalId(task.id)}
                          title="Delete Routine"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal: Create / Edit Daily Task */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTask ? 'Edit Daily Routine Task' : 'Add New Daily Routine Task'}
      >
        <form onSubmit={handleFormSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Task Title *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Solve 1 LeetCode problem, 30 min Workout, Apply to 2 Jobs"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Category</label>
              <select
                className="form-control"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {editingTask ? 'Update Routine' : 'Add Routine'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Confirm Delete */}
      <Modal
        isOpen={Boolean(deleteModalId)}
        onClose={() => setDeleteModalId(null)}
        title="Confirm Delete Daily Task"
      >
        <div className="modal-body">
          <p>Are you sure you want to delete this recurring daily task? All past logs for this item will also be removed.</p>
        </div>
        <div className="modal-footer">
          <button className="btn-secondary" onClick={() => setDeleteModalId(null)}>
            Cancel
          </button>
          <button
            className="btn-primary"
            style={{ background: '#ef4444' }}
            onClick={handleDeleteConfirm}
          >
            Delete Task
          </button>
        </div>
      </Modal>
    </div>
  );
}
