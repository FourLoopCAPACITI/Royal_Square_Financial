import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BellRing, CheckCheck, FileText, ListTodo } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext.jsx';
import { completeTask } from '../../services/taskService.js';
import { formatDate } from '../../utils/format.js';

const ICONS = { reminder: BellRing, document: FileText, task: ListTodo };

export default function NotificationList({ items, onNavigate, allowComplete = false }) {
  const { markRead, query } = useNotifications();
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState(null);
  const finish = async (item) => {
    setBusy(item.id);
    setError(null);
    try {
      await completeTask(item.taskId);
      markRead([item.id]);
      await query.reload();
    } catch (err) {
      setError(err.message || 'The task could not be completed. Please try again.');
    } finally { setBusy(null); }
  };

  return (
    <>
      {error && <p role="alert" className="p-4 text-danger">{error}</p>}
      <ul className="divide-y divide-brand-border">
        {items.map((item) => {
          const Icon = ICONS[item.kind];
          return (
            <li key={item.id} className={`flex gap-3 p-4 ${item.read ? 'bg-surface' : 'border-l-4 border-l-brand-red bg-brand-red-tint'}`}>
              <Icon size={19} className={`mt-1 shrink-0 ${item.urgent ? 'text-danger' : 'text-brand-red'}`} aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-[13px] font-semibold">
                  <span className={item.urgent ? 'text-danger' : 'text-text-secondary'}>{item.label}</span>
                  {!item.read && <span className="rounded-full bg-action px-2 py-0.5 text-white">Unread</span>}
                </div>
                <Link to={item.to} onClick={() => { markRead([item.id]); onNavigate?.(); }} className="mt-1 block break-words font-semibold text-brand-black hover:underline">
                  {item.title}
                </Link>
                {item.clientName && <p className="text-sm font-semibold">{item.clientName}</p>}
                <p className="mt-1 text-sm text-text-secondary">{item.message}</p>
                {item.date && <p className="mt-1 text-[13px] text-text-secondary">{item.dateLabel} <time dateTime={item.date}>{formatDate(item.date)}</time></p>}
                <div className="mt-2 flex flex-wrap gap-3">
                  {!item.read && (
                    <button type="button" onClick={() => markRead([item.id])} className="inline-flex min-h-9 items-center gap-1 rounded text-sm font-semibold text-brand-red hover:underline" aria-label={`Mark ${item.title} as read`}>
                      <CheckCheck size={15} aria-hidden="true" /> Mark as read
                    </button>
                  )}
                  {allowComplete && item.taskId && (
                    <button type="button" disabled={busy !== null} onClick={() => finish(item)} className="min-h-9 rounded border border-brand-border bg-surface px-3 text-sm font-semibold hover:border-brand-black disabled:opacity-50">
                      {busy === item.id ? 'Completing…' : 'Complete task'}
                    </button>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}
