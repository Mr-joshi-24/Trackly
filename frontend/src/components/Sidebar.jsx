import React from 'react';
import { LayoutDashboard, Activity, CheckSquare, Briefcase, Sun, Moon } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, theme, toggleTheme }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'daily', label: 'Daily Tracker', icon: Activity },
    { id: 'tasks', label: 'Task Manager', icon: CheckSquare },
    { id: 'applications', label: 'Job Applications', icon: Briefcase }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="brand-icon">
          <CheckSquare size={22} />
        </div>
        <div>
          <h1 className="brand-title">Trackly</h1>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <button className="theme-toggle-btn" onClick={toggleTheme}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
            {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
          </span>
          <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>Toggle</span>
        </button>

        <div className="system-badge">
          <div className="status-dot"></div>
          <span>SQLite Database Persistent</span>
        </div>
      </div>
    </aside>
  );
}
