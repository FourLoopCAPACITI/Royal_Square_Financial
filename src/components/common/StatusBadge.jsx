import { useI18n } from '../../i18n/I18nContext.jsx';

const TONES = {
  action: 'bg-action text-white',
  red: 'bg-danger-tint text-danger',
  success: 'bg-ok-tint text-ok',
  warning: 'bg-warn-tint text-warn',
  neutral: 'bg-brand-red-tint text-text-secondary ring-1 ring-inset ring-brand-border',
  dark: 'bg-strong text-white',
  gold: 'bg-warn-tint text-gold-deep ring-1 ring-inset ring-gold/50',
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
    <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-[13.5px] font-semibold ${TONES[finalTone]} ${className}`}>
      {children || (STATUS_MAP[status] ? t(`status.${status}`) : status)}
    </span>
  );
}
