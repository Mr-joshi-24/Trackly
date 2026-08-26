import React, { useState } from 'react';
import { Plus, Edit2, Trash2, CheckSquare, Square, Calendar, Filter, ArrowUpDown } from 'lucide-react';
import Modal from './Modal';

export default function TasksView({ tasks, loading, onCreateTask, onUpdateTask, onToggleTask, onDeleteTask }) {
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [sortBy, setSortBy] = useState('created_at');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deleteModalId, setDeleteModalId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: '',
    priority: 'Medium',
    status: 'Pending'
  });

  const openCreateModal = () => {
    setEditingTask(null);
    setFormData({
      title: '',
      description: '',
      due_date: '',
      priority: 'Medium',
      status: 'Pending'
    });
    setIsFormModalOpen(true);
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      due_date: task.due_date || '',
      priority: task.priority || 'Medium',
      status: task.status || 'Pending'
    });
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    if (editingTask) {
      await onUpdateTask(editingTask.id, formData);
    } else {
      await onCreateTask(formData);
    }
    setIsFormModalOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (deleteModalId) {
      await onDeleteTask(deleteModalId);
      setDeleteModalId(null);
    }
  };

  // Client-side filtering & sorting
  const filteredTasks = tasks.filter((task) => {
    const matchesStatus = statusFilter === 'All' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'All' || task.priority === priorityFilter;
    const matchesSearch = !searchTerm || 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesStatus && matchesPriority && matchesSearch;
  }).sort((a, b) => {
    if (sortBy === 'due_date') {
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return a.due_date.localeCompare(b.due_date);
    } else if (sortBy === 'priority') {
      const order = { High: 1, Medium: 2, Low: 3 };
      return (order[a.priority] || 4) - (order[b.priority] || 4);
    }
    return new Date(b.created_at) - new Date(a.created_at);
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Task Manager</h2>
          <p className="page-subtitle">Organize, prioritize, and complete your tasks efficiently.</p>
        </div>
        <button className="btn-primary" onClick={openCreateModal}>
          <Plus size={18} /> Add Task
        </button>
      </div>

      {/* Toolbar & Filters */}
      <div className="toolbar">
        <div className="toolbar-group">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={16} color="var(--text-dim)" />
            <select
              className="select-control"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
            </select>

            <select
              className="select-control"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="All">All Priorities</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>
          </div>
        </div>

        <div className="toolbar-group">
          <ArrowUpDown size={16} color="var(--text-dim)" />
          <select
            className="select-control"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="created_at">Latest Created</option>
            <option value="due_date">Due Date</option>
            <option value="priority">Priority Level</option>
          </select>
        </div>
      </div>

      {/* Tasks Table */}
      {loading ? (
        <div className="empty-state">Loading tasks...</div>
      ) : filteredTasks.length === 0 ? (
        <div className="table-container">
          <div className="empty-state">
            <CheckSquare size={36} className="empty-icon" />
            <div className="empty-title">No tasks found</div>
            <p>Try adjusting your search filters or add a new task to get started.</p>
          </div>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>Done</th>
                <th>Task Title & Notes</th>
                <th>Priority</th>
                <th>Due Date</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map((task) => {
                const isDone = task.status === 'Completed';
                return (
                  <tr key={task.id} style={{ opacity: isDone ? 0.65 : 1 }}>
                    <td>
                      <button
                        className="icon-btn"
                        onClick={() => onToggleTask(task.id)}
                        title={isDone ? 'Mark as Pending' : 'Mark as Completed'}
                        style={{ color: isDone ? '#34d399' : 'var(--text-dim)' }}
                      >
                        {isDone ? <CheckSquare size={20} /> : <Square size={20} />}
                      </button>
                    </td>
                    <td>
                      <div style={{ 
                        fontWeight: 600, 
                        textDecoration: isDone ? 'line-through' : 'none',
                        color: isDone ? 'var(--text-muted)' : 'var(--text-main)'
                      }}>
                        {task.title}
                      </div>
                      {task.description && (
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                          {task.description}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className={`badge badge-${task.priority.toLowerCase()}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td>
                      {task.due_date ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.88rem' }}>
                          <Calendar size={14} color="var(--text-dim)" />
                          {task.due_date}
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>-</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge badge-${task.status.toLowerCase()}`}>
                        {task.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="action-group" style={{ justifyContent: 'flex-end' }}>
                        <button
                          className="icon-btn"
                          onClick={() => openEditModal(task)}
                          title="Edit Task"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          className="icon-btn danger"
                          onClick={() => setDeleteModalId(task.id)}
                          title="Delete Task"
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

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingTask ? 'Edit Task' : 'Create New Task'}
      >
        <form onSubmit={handleFormSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Task Title *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Complete LeetCode 150 study plan"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Description / Notes (Optional)</label>
              <textarea
                className="form-control"
                placeholder="Add extra context, subtasks, or reference links..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Priority</label>
                <select
                  className="form-control"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              <div className="form-group">
                <label>Due Date (Optional)</label>
                <input
                  type="date"
                  className="form-control"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Status</label>
              <select
                className="form-control"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setIsFormModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {editingTask ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deleteModalId)}
        onClose={() => setDeleteModalId(null)}
        title="Confirm Delete Task"
      >
        <div className="modal-body">
          <p>Are you sure you want to delete this task? This action cannot be undone.</p>
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
