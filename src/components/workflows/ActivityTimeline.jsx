import { describeDay, formatTime } from '../../utils/format.js';
import { EmptyState } from '../common/States.jsx';
import { useI18n } from '../../i18n/I18nContext.jsx';

/** Chronological record of what happened, grouped by day, newest day first. */
export default function ActivityTimeline({ events = [], emptyMessage }) {
  const { t, tx } = useI18n();
  if (!events.length) return <EmptyState title={t('activity.emptyTitle')} message={emptyMessage || t('activity.emptyMessage')} />;

  const sorted = [...events].sort((a, b) => new Date(a.at) - new Date(b.at));
  const groups = [];
  sorted.forEach((event) => {
    const day = describeDay(event.at);
    const group = groups.find((g) => g.day === day);
    if (group) group.items.push(event);
    else groups.push({ day, items: [event] });
  });
  groups.reverse();

  return (
    <div className="space-y-5">
      {groups.map((group) => (
        <div key={group.day}>
          <p className="mb-2 text-[14.5px] font-semibold text-brand-grey">{group.day}</p>
          <ol className="space-y-0">
            {group.items.map((event) => (
              <li key={event.id} className="grid grid-cols-[52px_1fr] gap-3 border-l border-brand-border py-1.5 pl-3">
                <time dateTime={event.at} className="pt-px text-[14.5px] tabular-nums text-brand-grey">
                  {formatTime(event.at)}
                </time>
                <div>
                  <p className="leading-snug">{tx(event.message)}</p>
                  <p className="text-[14px] text-brand-grey">{tx(event.actorName)}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      ))}
    </div>
  );
}
