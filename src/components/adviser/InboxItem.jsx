import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import StatusBadge from '../common/StatusBadge.jsx';
import { describeWorkflowStatus, getCurrentStepStartedAt, getOwnerLabel, isWorkflowOverdue } from '../../utils/workflow.js';
import { describeDue, describeWaiting } from '../../utils/format.js';

/**
 * One row in the adviser Action Inbox:
 * client · process · current owner · next action · due / waiting.
 */
export default function InboxItem({ workflow, clientName, providerName }) {
  const overdue = isWorkflowOverdue(workflow);
  const owner = getOwnerLabel(workflow.currentOwner, { providerName, viewerRole: 'adviser', clientName });
  const waitingOnOthers = !['adviser', 'system'].includes(workflow.currentOwner);
  return (
    <li>
      <Link to={`/workflow/${workflow.id}`} className="group grid gap-2 p-4 hover:bg-brand-light-grey sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1.4fr)_auto] sm:items-center sm:gap-6">
        <div className="min-w-0">
          <p className="font-semibold">{clientName || 'Client'}</p>
          <p className="text-[15.5px] text-brand-grey">{workflow.title}</p>
        </div>
        <dl className="grid grid-cols-[110px_1fr] gap-x-3 text-[15.5px]">
          <dt className="text-brand-grey">Current owner</dt>
          <dd className="font-semibold">{owner}</dd>
          <dt className="text-brand-grey">Next action</dt>
          <dd>{workflow.nextAction}</dd>
          <dt className="text-brand-grey">{waitingOnOthers ? 'Waiting' : 'Due'}</dt>
          <dd className={overdue ? 'font-semibold text-brand-red' : ''}>
            {waitingOnOthers ? describeWaiting(getCurrentStepStartedAt(workflow)) : describeDue(workflow.dueDate)}
          </dd>
        </dl>
        <div className="flex items-center gap-2 sm:justify-end">
          {overdue ? <StatusBadge status="overdue" /> : <StatusBadge tone={waitingOnOthers ? 'neutral' : 'action'}>{waitingOnOthers ? describeWorkflowStatus(workflow, { providerName, clientName }) : 'Needs you'}</StatusBadge>}
          {workflow.priority === 'high' && <StatusBadge status="high" />}
          <ChevronRight size={18} className="text-brand-grey" aria-hidden="true" />
        </div>
      </Link>
    </li>
  );
}
