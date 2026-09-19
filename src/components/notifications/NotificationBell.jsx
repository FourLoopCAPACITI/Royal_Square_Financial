import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bell, X } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext.jsx';
import { useSession } from '../../context/SessionContext.jsx';
import { QueryState } from '../common/States.jsx';
import NotificationList from './NotificationList.jsx';

export default function NotificationBell() {
  const notifications = useNotifications();
  const { role } = useSession();
  const [open, setOpen] = useState(false);
  const container = useRef(null);
  const trigger = useRef(null);
  const close = useRef(null);
  const location = useLocation();
  useEffect(() => setOpen(false), [location.key, role]);
  useEffect(() => {
    if (!open) return;
    close.current?.focus();
    const outside = (event) => { if (!container.current?.contains(event.target)) setOpen(false); };
    const escape = (event) => {
      if (event.key === 'Escape') { setOpen(false); trigger.current?.focus(); }
    };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('keydown', escape);
    };
  }, [open]);
  if (!notifications) return null;
  const { query, unread, markRead } = notifications;
  const preview = [...notifications.notifications].sort((a, b) => Number(a.read) - Number(b.read)).slice(0, 6);

  return (
    <div ref={container} className="relative">
      <button ref={trigger} type="button" onClick={() => { setOpen(!open); if (!open) query.reload(); }}
        className="relative flex h-11 w-11 items-center justify-center rounded-full border border-brand-border text-brand-black hover:bg-brand-light-grey"
        aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`} aria-expanded={open} aria-controls="notification-preview">
        <Bell size={21} aria-hidden="true" />
        {unread > 0 && <span aria-hidden="true" className="absolute -right-1 -top-1 min-w-5 rounded-full bg-action px-1 text-center text-[11px] font-semibold text-white">{unread > 99 ? '99+' : unread}</span>}
      </button>
      <span className="sr-only" role="status">{!query.loading && !query.error ? `${unread} unread notifications` : ''}</span>
      {open && (
        <section id="notification-preview" aria-label="Notifications" className="fixed right-2 top-14 flex max-h-[calc(100dvh-5rem)] w-[min(420px,calc(100vw-1rem))] flex-col overflow-hidden rounded-lg border border-brand-border bg-surface shadow-xl sm:right-6">
          <div className="flex items-center justify-between border-b border-brand-border p-4">
            <h2 className="font-semibold">Notifications</h2>
            <button ref={close} type="button" aria-label="Close notifications" onClick={() => { setOpen(false); trigger.current?.focus(); }} className="rounded p-2 hover:bg-brand-light-grey"><X size={18} aria-hidden="true" /></button>
          </div>
          <div className="overflow-y-auto overscroll-contain">
            <div className="px-4">
              <QueryState query={query} loadingLabel="Loading notifications">
                {() => preview.length ? null : <p className="py-6 text-brand-grey">You're all caught up.</p>}
              </QueryState>
            </div>
            {!query.loading && !query.error && <NotificationList items={preview} onNavigate={() => setOpen(false)} />}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-brand-border p-4 text-sm font-semibold">
            <Link to={`/${role}/notifications`} className="text-brand-red hover:underline">View all notifications</Link>
            <button type="button" disabled={!unread || Boolean(query.error)} onClick={() => markRead(notifications.notifications.map((item) => item.id))} className="text-brand-grey hover:text-brand-black disabled:opacity-50">Mark all as read</button>
          </div>
        </section>
      )}
    </div>
  );
}
