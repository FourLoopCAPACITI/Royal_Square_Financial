const TONES = {
  action: 'bg-brand-red text-white',
  red: 'bg-brand-red-tint text-brand-red',
  success: 'bg-ok-tint text-ok',
  warning: 'bg-warn-tint text-warn',
  neutral: 'bg-brand-light-grey text-[#4A4A4A]',
  dark: 'bg-brand-black text-white',
};

/** Map common statuses to tones so every page labels them the same way. */
const STATUS_MAP = {
  current: { tone: 'success', label: 'Current' },
  missing: { tone: 'red', label: 'Missing' },
  expiring_soon: { tone: 'warning', label: 'Expiring soon' },
  expired: { tone: 'red', label: 'Expired' },
  under_review: { tone: 'neutral', label: 'Under review' },
  active: { tone: 'neutral', label: 'In progress' },
  in_progress: { tone: 'neutral', label: 'In progress' },
  completed: { tone: 'success', label: 'Completed' },
  overdue: { tone: 'red', label: 'Overdue' },
  high: { tone: 'warning', label: 'High priority' },
};

export default function StatusBadge({ status, tone, children, className = '' }) {
  const mapped = STATUS_MAP[status] || {};
  const finalTone = tone || mapped.tone || 'neutral';
  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded px-2 py-0.5 text-[14px] font-semibold ${TONES[finalTone]} ${className}`}>
      {children || mapped.label || status}
    </span>
  );
}
