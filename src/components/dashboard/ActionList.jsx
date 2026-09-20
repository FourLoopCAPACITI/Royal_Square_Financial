import { Link } from 'react-router-dom';
import { BellRing, CheckCircle2, CircleAlert } from 'lucide-react';
import { describeDue, daysUntil } from '../../utils/format.js';
import { EmptyState } from '../common/States.jsx';
import { useI18n } from '../../i18n/I18nContext.jsx';

/** Open tasks and reminders. Pass clientName to show whose task it is (adviser view). */
export default function ActionList({ tasks = [], clientName, onComplete, emptyTitle, emptyMessage }) {
  const { t, tx } = useI18n();
  if (!tasks.length) return <EmptyState icon={CheckCircle2} title={emptyTitle || t('actionList.empty')} message={emptyMessage || t('actionList.emptyHint')} />;
  return (
    <ul className="divide-y divide-brand-border rounded-lg border border-brand-border bg-surface shadow-card">
      {tasks.map((task) => {
        const days = daysUntil(task.dueDate);
        const urgency = days < 0 ? 'text-danger font-semibold' : days <= 7 ? 'text-warn font-semibold' : 'text-brand-grey';
        const Icon = task.kind === 'reminder' ? BellRing : CircleAlert;
        const href = task.workflowId ? `/workflow/${task.workflowId}` : task.link;
        return (
          <li key={task.id} className="flex items-start gap-3 p-4">
            <Icon size={18} className={`mt-0.5 shrink-0 ${days < 0 ? 'text-danger' : 'text-brand-black'}`} aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold leading-snug">{tx(task.title)}</p>
              <p className="text-[15.5px] text-brand-grey">
                {clientName ? `${clientName(task.clientId)}. ` : ''}
                {tx(task.description)}
              </p>
              <p className={`mt-1 text-[14.5px] ${urgency}`}>{describeDue(task.dueDate)}</p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1.5">
              {href && (
                <Link to={href} className="rounded border border-brand-border px-3 py-1.5 text-[15px] font-semibold hover:border-brand-black">
                  {t('common.open')}
                </Link>
              )}
              {onComplete && (
                <button type="button" onClick={() => onComplete(task.id)} className="text-[14.5px] text-brand-grey hover:text-brand-red">
                  {t('actionList.markDone')}
                </button>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
