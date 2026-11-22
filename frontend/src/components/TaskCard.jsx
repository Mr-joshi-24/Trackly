import React from 'react';
import { Calendar } from 'lucide-react';
import { formatDueDate } from '../utils/dateUtils';

export default function TaskCard({ task }) {
  if (!task) return null;

  const dueDateFormatted = formatDueDate(task.due_date || task.dueDate);

  return (
    <div className="task-card">
      <div style={{ minWidth: 0, flex: 1, marginRight: '0.75rem' }}>
        <div style={{ fontWeight: 500, fontSize: '0.9rem', color: 'var(--text-main)', wordBreak: 'break-word' }}>
          {task.title}
        </div>
        {dueDateFormatted && (
          <div className="task-card-due">
            <Calendar size={13} color="var(--text-dim)" />
            <span>{dueDateFormatted}</span>
          </div>
        )}
      </div>
      {task.priority && (
        <span className={`badge badge-${task.priority.toLowerCase()}`} style={{ flexShrink: 0 }}>
          {task.priority}
        </span>
      )}
    </div>
  );
}
