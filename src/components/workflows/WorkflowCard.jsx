import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import StatusBadge from '../common/StatusBadge.jsx';
import ProgressBar from '../common/ProgressBar.jsx';
import WorkflowOwner from './WorkflowOwner.jsx';
import { describeWorkflowStatus, getWorkflowProgress, isWorkflowOverdue } from '../../utils/workflow.js';
import { describeDue } from '../../utils/format.js';
import { useI18n } from '../../i18n/I18nContext.jsx';

/** Summary card for one process. Links to the full workflow page. */
export default function WorkflowCard({ workflow, providerName, clientName, viewerRole, showOwner = true }) {
  const { t, tx } = useI18n();
  const overdue = isWorkflowOverdue(workflow);
  const progress = getWorkflowProgress(workflow);
  const status = describeWorkflowStatus(workflow, { providerName, viewerRole });
  const needsViewer = workflow.currentOwner === viewerRole || (viewerRole === 'adviser' && workflow.currentOwner === 'system');

  return (
    <Link
      to={`/workflow/${workflow.id}`}
      className="group block rounded-md border border-brand-border bg-white p-4 transition-colors hover:border-brand-black sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-display text-[17px] font-medium">{tx(workflow.title)}</p>
          <p className="text-[13.5px] text-brand-grey">
            {[clientName, providerName].filter(Boolean).join(', ') || 'Royal Square Financial'}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {overdue ? (
            <StatusBadge status="overdue" />
          ) : needsViewer ? (
            <StatusBadge tone="action">{viewerRole === 'client' ? t('status.yourTurn') : t('status.needsYou')}</StatusBadge>
          ) : (
            <StatusBadge tone={workflow.status === 'completed' ? 'success' : 'neutral'}>{status}</StatusBadge>
          )}
          <ChevronRight size={18} className="text-brand-grey transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </div>
      </div>

      {showOwner && workflow.status === 'active' && (
        <div className="mt-4">
          <WorkflowOwner workflow={workflow} providerName={providerName} viewerRole={viewerRole} clientName={clientName} compact />
        </div>
      )}

      <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-2 text-[14px] sm:grid-cols-[1fr_auto]">
        <div>
          <dt className="label-muted">{t('workflow.nextAction')}</dt>
          <dd className="font-medium">{tx(workflow.nextAction)}</dd>
        </div>
        <div className="sm:text-right">
          <dt className="label-muted">{t('workflow.due')}</dt>
          <dd className={overdue ? 'font-semibold text-brand-red' : 'font-medium'}>{workflow.status === 'active' ? describeDue(workflow.dueDate) : t('workflow.closed')}</dd>
        </div>
      </dl>
      <ProgressBar value={progress} className="mt-4" label={t('workflow.progress', { title: tx(workflow.title) })} tone={workflow.status === 'completed' ? 'green' : 'red'} />
    </Link>
  );
}
