import React, { useState } from 'react';
import { Plus, Edit2, Trash2, ExternalLink, Calendar, Filter, Search, FileText, MapPin, Briefcase } from 'lucide-react';
import Modal from './Modal';

const STATUSES = ['Interested', 'Applied', 'Assessment', 'Interview', 'Selected', 'Rejected', 'Withdrawn'];
const JOB_TYPES = ['Full-time', 'Internship', 'Part-time'];

export default function ApplicationsView({ applications, loading, onCreateApp, onUpdateApp, onDeleteApp }) {
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState(null);
  const [deleteModalId, setDeleteModalId] = useState(null);
  const [notesModalApp, setNotesModalApp] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    company_name: '',
    role: '',
    job_type: 'Full-time',
    location: '',
    application_date: new Date().toISOString().split('T')[0],
    job_url: '',
    status: 'Applied',
    follow_up_date: '',
    notes: ''
  });

  const openCreateModal = () => {
    setEditingApp(null);
    setFormData({
      company_name: '',
      role: '',
      job_type: 'Full-time',
      location: '',
      application_date: new Date().toISOString().split('T')[0],
      job_url: '',
      status: 'Applied',
      follow_up_date: '',
      notes: ''
    });
    setIsFormModalOpen(true);
  };

  const openEditModal = (app) => {
    setEditingApp(app);
    setFormData({
      company_name: app.company_name,
      role: app.role,
      job_type: app.job_type || 'Full-time',
      location: app.location || '',
      application_date: app.application_date || new Date().toISOString().split('T')[0],
      job_url: app.job_url || '',
      status: app.status || 'Applied',
      follow_up_date: app.follow_up_date || '',
      notes: app.notes || ''
    });
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.company_name.trim() || !formData.role.trim()) return;

    if (editingApp) {
      await onUpdateApp(editingApp.id, formData);
    } else {
      await onCreateApp(formData);
    }
    setIsFormModalOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (deleteModalId) {
      await onDeleteApp(deleteModalId);
      setDeleteModalId(null);
    }
  };

  // Filter applications
  const filteredApps = applications.filter((app) => {
    const matchesStatus = statusFilter === 'All' || app.status === statusFilter;
    const matchesSearch = !searchTerm || 
      app.company_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      app.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.location && app.location.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesStatus && matchesSearch;
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Job Application Tracker</h2>
          <p className="page-subtitle">Track your tech jobs & internship applications, interview steps, and follow-ups.</p>
        </div>
        <button className="btn-primary" onClick={openCreateModal}>
          <Plus size={18} /> Add Application
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="toolbar">
        <div className="toolbar-group">
          <div className="search-box">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search by company or role..."
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
              {STATUSES.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Showing {filteredApps.length} of {applications.length} applications
        </div>
      </div>

      {/* Applications Table */}
      {loading ? (
        <div className="empty-state">Loading applications...</div>
      ) : filteredApps.length === 0 ? (
        <div className="table-container">
          <div className="empty-state">
            <Briefcase size={36} className="empty-icon" />
            <div className="empty-title">No job applications found</div>
            <p>Try clearing your filters or record a new application above.</p>
          </div>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Company & Role</th>
                <th>Type / Location</th>
                <th>Applied Date</th>
                <th>Status</th>
                <th>Follow-up</th>
                <th>Link / Notes</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredApps.map((app) => (
                <tr key={app.id}>
                  <td>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{app.company_name}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{app.role}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 500 }}>{app.job_type}</span>
                      {app.location && (
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                          <MapPin size={12} /> {app.location}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem' }}>
                      <Calendar size={14} color="var(--text-dim)" />
                      {app.application_date}
                    </div>
                  </td>
                  <td>
                    <span className={`badge badge-${app.status.toLowerCase()}`}>
                      {app.status}
                    </span>
                  </td>
                  <td>
                    {app.follow_up_date ? (
                      <span style={{ fontSize: '0.85rem', color: '#fbbf24', fontWeight: 500 }}>
                        {app.follow_up_date}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>-</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {app.job_url ? (
                        <a
                          href={app.job_url.startsWith('http') ? app.job_url : `https://${app.job_url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="icon-btn"
                          title="Open Application Posting URL"
                          style={{ color: 'var(--accent-secondary)' }}
                        >
                          <ExternalLink size={16} />
                        </a>
                      ) : null}

                      {app.notes ? (
                        <button
                          className="icon-btn"
                          onClick={() => setNotesModalApp(app)}
                          title="View Application Notes"
                        >
                          <FileText size={16} />
                        </button>
                      ) : null}
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="action-group" style={{ justifyContent: 'flex-end' }}>
                      <button
                        className="icon-btn"
                        onClick={() => openEditModal(app)}
                        title="Edit Application"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        className="icon-btn danger"
                        onClick={() => setDeleteModalId(app.id)}
                        title="Delete Application"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit Application Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingApp ? 'Edit Job Application' : 'Add New Job Application'}
      >
        <form onSubmit={handleFormSubmit}>
          <div className="modal-body">
            <div className="form-row">
              <div className="form-group">
                <label>Company Name *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Google, Microsoft, Stripe"
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Role / Position *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Software Engineer Intern"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Job Type</label>
                <select
                  className="form-control"
                  value={formData.job_type}
                  onChange={(e) => setFormData({ ...formData, job_type: e.target.value })}
                >
                  {JOB_TYPES.map((jt) => (
                    <option key={jt} value={jt}>{jt}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Location (Optional)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Remote, San Francisco, NY"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Application Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={formData.application_date}
                  onChange={(e) => setFormData({ ...formData, application_date: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Status</label>
                <select
                  className="form-control"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  {STATUSES.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Job Posting URL (Optional)</label>
                <input
                  type="url"
                  className="form-control"
                  placeholder="https://..."
                  value={formData.job_url}
                  onChange={(e) => setFormData({ ...formData, job_url: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Next Follow-Up Date (Optional)</label>
                <input
                  type="date"
                  className="form-control"
                  value={formData.follow_up_date}
                  onChange={(e) => setFormData({ ...formData, follow_up_date: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Notes / Reminders (Optional)</label>
              <textarea
                className="form-control"
                placeholder="Recruiter contact name, referral info, interview preparation points..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
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
              {editingApp ? 'Update Application' : 'Save Application'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Notes View Modal */}
      <Modal
        isOpen={Boolean(notesModalApp)}
        onClose={() => setNotesModalApp(null)}
        title={notesModalApp ? `${notesModalApp.company_name} - ${notesModalApp.role} Notes` : 'Notes'}
      >
        <div className="modal-body">
          <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', fontSize: '0.95rem' }}>
            {notesModalApp?.notes || 'No notes available.'}
          </p>
        </div>
        <div className="modal-footer">
          <button className="btn-secondary" onClick={() => setNotesModalApp(null)}>
            Close
          </button>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deleteModalId)}
        onClose={() => setDeleteModalId(null)}
        title="Confirm Delete Application"
      >
        <div className="modal-body">
          <p>Are you sure you want to delete this job application entry? This action cannot be undone.</p>
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
            Delete Application
          </button>
        </div>
      </Modal>
    </div>
  );
}
