import React from 'react';
import { 
  CheckSquare, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Briefcase, 
  TrendingUp, 
  Users, 
  Award, 
  XCircle,
  ArrowRight,
  Activity
} from 'lucide-react';

export default function DashboardView({ stats, loading, setActiveTab }) {
  if (loading || !stats) {
    return <div className="empty-state">Loading dashboard stats...</div>;
  }

  const { daily = {}, tasks, applications } = stats;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Overview Dashboard</h2>
          <p className="page-subtitle">Summary of your daily movements, long-term tasks, and job applications.</p>
        </div>
      </div>

      {/* Daily Movements Summary Card */}
      <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-muted)' }}>
        Daily Routine & Movements
      </h3>
      <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        <div className="metric-card" style={{ borderLeft: '4px solid var(--accent-primary)' }}>
          <div className="metric-header">
            <span>Today's Daily Movements</span>
            <div className="metric-icon" style={{ backgroundColor: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-primary)' }}>
              <Activity size={18} />
            </div>
          </div>
          <div className="metric-value" style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
            <span>{daily.completed} / {daily.total}</span>
            <span style={{ fontSize: '1.25rem', color: 'var(--accent-primary)' }}>({daily.percentage}%)</span>
          </div>
          <div className="metric-subtitle">Routines completed today</div>
        </div>
      </div>

      {/* Task Summary Cards */}
      <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: '2rem 0 1rem 0', color: 'var(--text-muted)' }}>
        Long-Term Task Overview
      </h3>
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-header">
            <span>Total Tasks</span>
            <div className="metric-icon" style={{ backgroundColor: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
              <CheckSquare size={18} />
            </div>
          </div>
          <div className="metric-value">{tasks.total}</div>
          <div className="metric-subtitle">All managed items</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span>Pending Tasks</span>
            <div className="metric-icon" style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
              <Clock size={18} />
            </div>
          </div>
          <div className="metric-value" style={{ color: '#fbbf24' }}>{tasks.pending}</div>
          <div className="metric-subtitle">To be completed</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span>Completed</span>
            <div className="metric-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="metric-value" style={{ color: '#34d399' }}>{tasks.completed}</div>
          <div className="metric-subtitle">Finished tasks</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span>Due Soon (3 Days)</span>
            <div className="metric-icon" style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }}>
              <AlertCircle size={18} />
            </div>
          </div>
          <div className="metric-value" style={{ color: tasks.due_soon > 0 ? '#f87171' : 'var(--text-main)' }}>
            {tasks.due_soon}
          </div>
          <div className="metric-subtitle">Action required soon</div>
        </div>
      </div>

      {/* Job Applications Summary Cards */}
      <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: '2rem 0 1rem 0', color: 'var(--text-muted)' }}>
        Job Applications Tracker
      </h3>
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-header">
            <span>Total Applications</span>
            <div className="metric-icon" style={{ backgroundColor: 'rgba(14, 165, 233, 0.15)', color: '#38bdf8' }}>
              <Briefcase size={18} />
            </div>
          </div>
          <div className="metric-value">{applications.total}</div>
          <div className="metric-subtitle">Total track records</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span>Active Pipeline</span>
            <div className="metric-icon" style={{ backgroundColor: 'rgba(168, 85, 247, 0.15)', color: '#c084fc' }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="metric-value" style={{ color: '#c084fc' }}>{applications.active}</div>
          <div className="metric-subtitle">Applied / Assessment</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span>Interviews</span>
            <div className="metric-icon" style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
              <Users size={18} />
            </div>
          </div>
          <div className="metric-value" style={{ color: '#fbbf24' }}>{applications.interviews}</div>
          <div className="metric-subtitle">Interview rounds</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span>Selected</span>
            <div className="metric-icon" style={{ backgroundColor: 'rgba(34, 197, 94, 0.15)', color: '#4ade80' }}>
              <Award size={18} />
            </div>
          </div>
          <div className="metric-value" style={{ color: '#4ade80' }}>{applications.selected}</div>
          <div className="metric-subtitle">Offers & acceptances</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span>Rejected</span>
            <div className="metric-icon" style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }}>
              <XCircle size={18} />
            </div>
          </div>
          <div className="metric-value" style={{ color: '#f87171' }}>{applications.rejected}</div>
          <div className="metric-subtitle">Unsuccessful</div>
        </div>
      </div>

      {/* Quick Action Preview Panels */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
        {/* Pending Tasks Preview */}
        <div className="table-container" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>Top Pending Tasks</h4>
            <button 
              className="btn-secondary" 
              onClick={() => setActiveTab('tasks')}
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
            >
              View All <ArrowRight size={14} />
            </button>
          </div>
          {tasks.recent && tasks.recent.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {tasks.recent.map((task) => (
                <div key={task.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.75rem', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-md)' }}>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{task.title}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Due: {task.due_date || 'No due date'}</div>
                  </div>
                  <span className={`badge badge-${task.priority.toLowerCase()}`}>{task.priority}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '1.5rem 0' }}>No pending tasks!</div>
          )}
        </div>

        {/* Recent Applications Preview */}
        <div className="table-container" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>Recent Applications</h4>
            <button 
              className="btn-secondary" 
              onClick={() => setActiveTab('applications')}
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
            >
              View All <ArrowRight size={14} />
            </button>
          </div>
          {applications.recent && applications.recent.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {applications.recent.map((app) => (
                <div key={app.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.75rem', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-md)' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{app.company_name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{app.role}</div>
                  </div>
                  <span className={`badge badge-${app.status.toLowerCase()}`}>{app.status}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '1.5rem 0' }}>No job applications recorded yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
