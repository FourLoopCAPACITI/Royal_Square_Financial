import { Users } from 'lucide-react';
import ProgressBar from '../common/ProgressBar.jsx';
import { formatDate, formatZAR, percent } from '../../utils/format.js';

export default function GoalCard({ goal, ownerLabel, compact = false }) {
  const pct = percent(goal.currentAmount, goal.targetAmount);
  return (
    <div className={`rounded-md border border-brand-border ${compact ? 'p-4' : 'p-5'}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-[17px] font-medium">{goal.name}</p>
          <p className="flex items-center gap-1.5 text-[13px] text-brand-grey">
            {goal.ownerType === 'household' && <Users size={13} aria-hidden="true" />}
            {ownerLabel || (goal.ownerType === 'household' ? 'Shared household goal' : 'Personal goal')}
          </p>
        </div>
        <p className="font-display text-[22px] font-light tabular-nums">{pct}%</p>
      </div>
      <ProgressBar value={pct} tone={pct >= 100 ? 'green' : 'dark'} className="mt-3" label={`${goal.name} progress`} />
      <p className="mt-2 text-[14px] tabular-nums">
        <span className="font-semibold">{formatZAR(goal.currentAmount)}</span>
        <span className="text-brand-grey"> of {formatZAR(goal.targetAmount)}</span>
      </p>
      {!compact && goal.targetDate && <p className="text-[13px] text-brand-grey">Target date {formatDate(goal.targetDate)}</p>}
    </div>
  );
}
