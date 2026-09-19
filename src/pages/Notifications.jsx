import { useSearchParams } from 'react-router-dom';
import { Bell } from 'lucide-react';
import PageHeader from '../components/common/PageHeader.jsx';
import Button from '../components/common/Button.jsx';
import { EmptyState, QueryState } from '../components/common/States.jsx';
import NotificationList from '../components/notifications/NotificationList.jsx';
import { useNotifications } from '../context/NotificationContext.jsx';

const FILTERS = [['all', 'All'], ['unread', 'Unread'], ['reminder', 'Reminders'], ['document', 'Documents'], ['task', 'Tasks']];

export default function Notifications() {
  const context = useNotifications();
  const [params, setParams] = useSearchParams();
  if (!context) return <EmptyState title="Notifications unavailable" message="Sign in as a client or adviser to view notifications." />;
  const { query, notifications, unread, markRead } = context;
  const requested = params.get('type');
  const filter = FILTERS.some(([key]) => key === requested) ? requested : 'all';
  const shown = notifications.filter((item) => filter === 'all' || (filter === 'unread' ? !item.read : item.kind === filter));

  return (
    <>
      <PageHeader title="Notifications" description="Reminders, document updates and tasks that need your attention."
        actions={<Button variant="secondary" disabled={!unread || Boolean(query.error)} onClick={() => markRead(notifications.map((item) => item.id))}>Mark all as read</Button>} />
      <div className="mb-5 flex flex-wrap gap-2" role="group" aria-label="Filter notifications">
        {FILTERS.map(([key, label]) => (
          <button key={key} type="button" aria-pressed={filter === key} onClick={() => setParams(key === 'all' ? {} : { type: key })}
            className={`min-h-10 rounded border px-3 py-2 text-sm font-semibold ${filter === key ? 'border-brand-red bg-action text-white' : 'border-brand-border hover:border-brand-black'}`}>
            {label}{key === 'unread' && unread > 0 ? ` (${unread})` : ''}
          </button>
        ))}
      </div>
      <QueryState query={query} loadingLabel="Loading notifications">
        {() => shown.length ? (
          <div className="overflow-hidden rounded-md border border-brand-border"><NotificationList items={shown} allowComplete /></div>
        ) : <EmptyState icon={Bell} title={filter === 'unread' ? "You're all caught up" : 'No notifications'} message="New reminders, document updates and open tasks will appear here." />}
      </QueryState>
    </>
  );
}
