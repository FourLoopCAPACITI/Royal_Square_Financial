import { Check } from 'lucide-react';
import { getOwnerLabel, getOwnerSequence } from '../../utils/workflow.js';

const STATE_TEXT = {
  complete: 'Complete',
  current: 'Holding the ball',
  paused: 'Done for now',
  later: 'Later',
};

/**
 * "Who's holding the ball?" — the parties in a process, left to right,
 * with the current owner shown as a solid Royal Square red block.
 */
export default function WorkflowOwner({ workflow, providerName, viewerRole, clientName, compact = false }) {
  const sequence = getOwnerSequence(workflow);
  if (!sequence.length) return null;

  return (
    <ol className="flex w-full overflow-x-auto" aria-label="Who is responsible at each stage">
      {sequence.map(({ owner, state }) => {
        const name = getOwnerLabel(owner, { providerName, viewerRole, clientName });
        const isCurrent = state === 'current';
        const base = compact ? 'min-w-[96px] px-2.5 py-2' : 'min-w-[128px] px-3.5 py-3';
        const tone = isCurrent
          ? 'bg-action text-white border-brand-red'
          : state === 'later'
            ? 'bg-surface text-brand-grey border-brand-border border-dashed'
            : 'bg-brand-light-grey text-brand-black border-brand-light-grey';
        return (
          <li
            key={owner}
            className={`relative flex-1 border ${tone} ${base} first:rounded-l-md last:rounded-r-md`}
            aria-current={isCurrent ? 'step' : undefined}
          >
            <span className={`block truncate font-display ${compact ? 'text-[11px]' : 'text-[13px]'} font-medium uppercase tracking-[0.2em]`}>{name}</span>
            <span className={`mt-1 flex items-center gap-1.5 ${compact ? 'text-[12px]' : 'text-[13px]'} ${isCurrent ? 'text-white/90' : ''}`}>
              {isCurrent && <span className="rsf-ball inline-block h-2 w-2 rounded-full bg-white" aria-hidden="true" />}
              {(state === 'complete' || state === 'paused') && <Check size={13} aria-hidden="true" />}
              {STATE_TEXT[state]}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
