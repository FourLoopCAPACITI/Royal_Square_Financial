import { Users } from 'lucide-react';
import ProgressBar from '../common/ProgressBar.jsx';
import { formatDate, formatZAR, percent } from '../../utils/format.js';
import { useI18n } from '../../i18n/I18nContext.jsx';

export default function GoalCard({ goal, ownerLabel, compact = false }) {
  const { t, tx } = useI18n();
  const pct = percent(goal.currentAmount, goal.targetAmount);
  return (
    <div className={`rounded-md border border-brand-border ${compact ? 'p-4' : 'p-5'}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-[17px] font-medium">{tx(goal.name)}</p>
          <p className="flex items-center gap-1.5 text-[13px] text-brand-grey">
            {goal.ownerType === 'household' && <Users size={13} aria-hidden="true" />}
            {ownerLabel || (goal.ownerType === 'household' ? t('goals.sharedHousehold') : t('goals.personal'))}
          </p>
        </div>
        <p className="font-display text-[22px] font-light tabular-nums">{pct}%</p>
      </div>
      <ProgressBar value={pct} tone={pct >= 100 ? 'green' : 'dark'} className="mt-3" label={t('goals.progress', { name: tx(goal.name) })} />
      <p className="mt-2 text-[14px] tabular-nums">
        <span className="font-semibold">{formatZAR(goal.currentAmount)}</span>
        <span className="text-brand-grey"> {t('goals.of', { amount: formatZAR(goal.targetAmount) })}</span>
      </p>
      {!compact && goal.targetDate && <p className="text-[13px] text-brand-grey">{t('goals.targetDate', { date: formatDate(goal.targetDate) })}</p>}
    </div>
  );
}
