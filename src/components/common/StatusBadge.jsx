import { useI18n } from '../../i18n/I18nContext.jsx';

const TONES = {
  action: 'bg-action text-white',
  red: 'bg-brand-red-tint text-brand-red',
  success: 'bg-ok-tint text-ok',
  warning: 'bg-warn-tint text-warn',
  neutral: 'bg-brand-light-grey text-text-secondary',
  dark: 'bg-strong text-white',
};

/** Map common statuses to tones so every page labels them the same way. */
const STATUS_MAP = {
  current: { tone: 'success' },
  missing: { tone: 'red' },
  expiring_soon: { tone: 'warning' },
  expired: { tone: 'red' },
  under_review: { tone: 'neutral' },
  active: { tone: 'neutral' },
  in_progress: { tone: 'neutral' },
  completed: { tone: 'success' },
  overdue: { tone: 'red' },
  high: { tone: 'warning' },
};

export default function StatusBadge({ status, tone, children, className = '' }) {
  const { t } = useI18n();
  const mapped = STATUS_MAP[status] || {};
  const finalTone = tone || mapped.tone || 'neutral';
  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded px-2 py-0.5 text-[12.5px] font-semibold ${TONES[finalTone]} ${className}`}>
      {children || (STATUS_MAP[status] ? t(`status.${status}`) : status)}
    </span>
  );
}
