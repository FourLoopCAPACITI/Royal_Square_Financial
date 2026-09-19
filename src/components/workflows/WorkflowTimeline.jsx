import { Check } from 'lucide-react';
import { getOwnerLabel } from '../../utils/workflow.js';
import { describeDue, formatShortDate, formatTime } from '../../utils/format.js';
import { useI18n } from '../../i18n/I18nContext.jsx';

/** Step-by-step progress: ✓ done, ● current, ○ upcoming. */
export default function WorkflowTimeline({ workflow, providerName, viewerRole, clientName }) {
  const { t, tx } = useI18n();
  if (!workflow?.steps?.length) return null;
  return (
    <ol className="relative">
      {workflow.steps.map((step, index) => {
        const isLast = index === workflow.steps.length - 1;
        const owner = getOwnerLabel(step.owner, { providerName, viewerRole, clientName });
        return (
          <li key={step.id} className="relative flex gap-4 pb-5 last:pb-0">
            {!isLast && (
              <span
                className={`absolute left-[11px] top-6 h-[calc(100%-18px)] w-px ${step.status === 'complete' ? 'bg-brand-black' : 'bg-brand-border'}`}
                aria-hidden="true"
              />
            )}
            <span className="relative z-10 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center" aria-hidden="true">
              {step.status === 'complete' && (
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-black text-white">
                  <Check size={14} strokeWidth={3} />
                </span>
              )}
              {step.status === 'current' && (
                <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-brand-red bg-white">
                  <span className="h-2.5 w-2.5 rounded-full bg-brand-red" />
                </span>
              )}
              {step.status === 'upcoming' && <span className="h-6 w-6 rounded-full border-2 border-brand-border bg-white" />}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <p className={`${step.status === 'current' ? 'font-semibold text-brand-red' : step.status === 'upcoming' ? 'text-brand-grey' : 'font-medium'}`}>
                  {tx(step.label)}
                  <span className="sr-only"> ({t(`workflow.stepStatus.${step.status}`)})</span>
                </p>
                <p className="text-[13px] text-brand-grey">
                  {step.status === 'complete' && step.completedAt && `${formatShortDate(step.completedAt)}, ${formatTime(step.completedAt)}`}
                  {step.status === 'current' && describeDue(workflow.dueDate)}
                </p>
              </div>
              <p className="text-[13px] text-brand-grey">
                {step.status === 'current' ? `${owner}: ${tx(step.nextAction)}` : owner}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
