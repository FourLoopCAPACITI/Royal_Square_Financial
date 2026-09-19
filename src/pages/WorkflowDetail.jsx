import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Button from '../components/common/Button.jsx';
import StatusBadge from '../components/common/StatusBadge.jsx';
import ProgressBar from '../components/common/ProgressBar.jsx';
import { QueryState, EmptyState } from '../components/common/States.jsx';
import WorkflowOwner from '../components/workflows/WorkflowOwner.jsx';
import WorkflowTimeline from '../components/workflows/WorkflowTimeline.jsx';
import ActivityTimeline from '../components/workflows/ActivityTimeline.jsx';
import ClaimDetails from '../components/claims/ClaimDetails.jsx';
import { useServiceQuery } from '../hooks/useServiceQuery.js';
import { useLookups } from '../hooks/useLookups.js';
import { useSession } from '../context/SessionContext.jsx';
import { advance, getWorkflow, listActivity, recordEvents } from '../services/workflowService.js';
import { assignClaimNumberIfNeeded, getClaimByWorkflow } from '../services/claimService.js';
import { createActivityEvent, describeWorkflowStatus, getCurrentStep, getOwnerLabel, getWorkflowProgress, isWorkflowOverdue } from '../utils/workflow.js';
import { describeDue } from '../utils/format.js';

const DOCUMENT_STEPS = ['proof_of_address', 'client_documents'];

function CurrentStepPanel({ workflow, viewerRole, providerName, clientName, onAdvance, onRemind, busy }) {
  const step = getCurrentStep(workflow);
  if (workflow.status !== 'active' || !step) {
    return (
      <div className="rounded-md border border-ok/30 bg-ok-tint p-5 text-ok">
        <p className="font-semibold">This process is complete</p>
        <p className="text-[15.5px]">Nothing else is needed from anyone.</p>
      </div>
    );
  }
  const owner = workflow.currentOwner;
  const ownerName = getOwnerLabel(owner, { providerName, viewerRole, clientName });
  const overdue = isWorkflowOverdue(workflow);

  let action = null;
  if (viewerRole === 'client' && owner === 'client') {
    action = DOCUMENT_STEPS.includes(step.key) ? (
      <Button as={Link} to="/client/documents">Upload document</Button>
    ) : (
      <Button onClick={() => onAdvance({ actorType: 'client', actorName: 'Client' })} disabled={busy}>I've done this</Button>
    );
  }
  if (viewerRole !== 'client') {
    if (owner === 'adviser' || owner === 'system') {
      action = <Button onClick={() => onAdvance({ actorType: 'adviser', actorName: 'Royal Square' })} disabled={busy}>Mark step complete</Button>;
    } else if (owner === 'provider' || owner === 'repairer') {
      action = (
        <div className="flex flex-col items-start gap-1">
          <Button variant="dark" onClick={() => onAdvance({ actorType: owner, actorName: ownerName, note: `${ownerName}: ${step.label.toLowerCase()} confirmed` })} disabled={busy}>
            Record update from {ownerName}
          </Button>
          <span className="text-[14px] text-brand-grey">Provider updates are simulated in this prototype.</span>
        </div>
      );
    } else if (owner === 'client') {
      action = <Button variant="secondary" onClick={onRemind} disabled={busy}>Send reminder to client</Button>;
    }
  }

  return (
    <div className={`rounded-md border p-5 ${owner === viewerRole ? 'border-brand-red' : 'border-brand-border'}`}>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <p className="text-[14.5px] text-brand-grey">Current step</p>
          <p className="font-semibold">{step.label}</p>
        </div>
        <div>
          <p className="text-[14.5px] text-brand-grey">Next action</p>
          <p className="font-semibold">{workflow.nextAction}</p>
          <p className="text-[15px] text-brand-grey">by {ownerName}</p>
        </div>
        <div>
          <p className="text-[14.5px] text-brand-grey">Due</p>
          <p className={`font-semibold ${overdue ? 'text-brand-red' : ''}`}>{describeDue(workflow.dueDate)}</p>
        </div>
      </div>
      {action && <div className="mt-5 border-t border-brand-border pt-4">{action}</div>}
    </div>
  );
}

export default function WorkflowDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role } = useSession();
  const viewerRole = role === 'admin' ? 'adviser' : role;
  const [busy, setBusy] = useState(false);
  const workflow = useServiceQuery(() => getWorkflow(id), [id]);
  const activity = useServiceQuery(() => listActivity({ workflowId: id }), [id]);
  const claim = useServiceQuery(() => getClaimByWorkflow(id), [id]);
  const { providerName, clientName } = useLookups();

  async function onAdvance(actor) {
    setBusy(true);
    const stepKey = getCurrentStep(workflow.data)?.key;
    await advance(id, actor);
    await assignClaimNumberIfNeeded(id, stepKey);
    setBusy(false);
  }

  async function onRemind() {
    setBusy(true);
    await recordEvents([createActivityEvent(workflow.data, { actorType: 'adviser', actorName: 'Royal Square', message: 'Reminder sent to client' })]);
    setBusy(false);
  }

  return (
    <>
      <button type="button" onClick={() => navigate(-1)} className="mb-5 inline-flex items-center gap-1.5 text-[15.5px] text-brand-grey hover:text-brand-black">
        <ArrowLeft size={16} aria-hidden="true" /> Back
      </button>
      <QueryState query={workflow} loadingLabel="Loading process">
        {(w) => {
          if (!w) return <EmptyState title="Process not found" message="It may have been removed, or you may not have access to it." />;
          const pName = providerName(w.providerId);
          const cName = clientName(w.clientId);
          const progress = getWorkflowProgress(w);
          return (
            <>
              <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h1 className="text-[28px] font-normal leading-tight sm:text-[32px]">{w.title}</h1>
                  <p className="text-brand-grey">{[viewerRole !== 'client' && cName, pName].filter(Boolean).join(', ') || 'Royal Square Financial'}</p>
                </div>
                <div className="flex items-center gap-2">
                  {w.priority === 'high' && <StatusBadge status="high" />}
                  <StatusBadge tone={w.status === 'completed' ? 'success' : 'neutral'}>{describeWorkflowStatus(w, { providerName: pName, viewerRole })}</StatusBadge>
                </div>
              </header>

              <section aria-label="Who is holding the ball" className="mb-6">
                <WorkflowOwner workflow={w} providerName={pName} viewerRole={viewerRole} clientName={cName} />
                <div className="mt-3 flex items-center gap-3">
                  <ProgressBar value={progress} className="flex-1" label="Overall progress" tone={w.status === 'completed' ? 'green' : 'red'} />
                  <span className="text-[14.5px] tabular-nums text-brand-grey">{progress}%</span>
                </div>
              </section>

              <div className="mb-8">
                <CurrentStepPanel workflow={w} viewerRole={viewerRole} providerName={pName} clientName={cName} onAdvance={onAdvance} onRemind={onRemind} busy={busy} />
              </div>

              {claim.data && (
                <div className="mb-8">
                  <ClaimDetails claim={claim.data} />
                </div>
              )}

              <div className="grid gap-10 lg:grid-cols-2">
                <section>
                  <h2 className="mb-4 border-b border-brand-border pb-2 text-lg font-medium">Steps</h2>
                  <WorkflowTimeline workflow={w} providerName={pName} viewerRole={viewerRole} clientName={cName} />
                </section>
                <section>
                  <h2 className="mb-4 border-b border-brand-border pb-2 text-lg font-medium">Activity</h2>
                  <QueryState query={activity}>{(events) => <ActivityTimeline events={events} />}</QueryState>
                </section>
              </div>
            </>
          );
        }}
      </QueryState>
    </>
  );
}
