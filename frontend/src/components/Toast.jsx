import React from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function Toast({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast ${toast.type || 'info'}`}>
          {toast.type === 'success' ? (
            <CheckCircle2 size={18} color="#10b981" />
          ) : (
            <AlertCircle size={18} color="#ef4444" />
          )}
          <span>{toast.message}</span>
          <button
            className="icon-btn"
            onClick={() => onDismiss(toast.id)}
            style={{ marginLeft: 'auto', padding: '0.2rem' }}
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
