import { Check } from 'lucide-react';
import { getOwnerLabel, getOwnerSequence } from '../../utils/workflow.js';
import { useI18n } from '../../i18n/I18nContext.jsx';

/**
 * "Who's holding the ball?" — the parties in a process, left to right,
 * with the current owner shown as a solid Royal Square navy block.
 */
export default function WorkflowOwner({ workflow, providerName, viewerRole, clientName, compact = false }) {
  const { t } = useI18n();
  const sequence = getOwnerSequence(workflow);
  if (!sequence.length) return null;

  return (
    <ol className="flex w-full overflow-x-auto" aria-label={t('owner.aria')}>
      {sequence.map(({ owner, state }) => {
        const name = getOwnerLabel(owner, { providerName, viewerRole, clientName });
        const isCurrent = state === 'current';
        const base = compact ? 'min-w-[96px] px-2.5 py-2' : 'min-w-[128px] px-3.5 py-3';
        const tone = isCurrent
          ? 'bg-action text-white border-action shadow-card'
          : state === 'later'
            ? 'bg-surface text-brand-grey border-brand-border border-dashed'
            : 'bg-brand-light-grey text-brand-black border-brand-light-grey';
        return (
          <li
            key={owner}
            className={`relative flex-1 border ${tone} ${base} first:rounded-l-md last:rounded-r-md`}
            aria-current={isCurrent ? 'step' : undefined}
          >
            <span className={`block truncate font-display ${compact ? 'text-[12.5px]' : 'text-[14.5px]'} font-medium uppercase tracking-[0.2em]`}>{name}</span>
            <span className={`mt-1 flex items-center gap-1.5 ${compact ? 'text-[13.5px]' : 'text-[14.5px]'} ${isCurrent ? 'opacity-90' : ''}`}>
              {isCurrent && <span className="rsf-ball inline-block h-2 w-2 rounded-full bg-gold" aria-hidden="true" />}
              {(state === 'complete' || state === 'paused') && <Check size={13} aria-hidden="true" />}
              {t(`owner.state.${state}`)}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
