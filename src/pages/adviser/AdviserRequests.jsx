import { Link } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import { QueryState, EmptyState } from '../../components/common/States.jsx';
import { useAdviserWorkflows } from '../../hooks/useAdviserData.js';
import { useServiceQuery } from '../../hooks/useServiceQuery.js';
import { useLookups } from '../../hooks/useLookups.js';
import { listServiceRequests } from '../../services/requestService.js';
import { getServiceRequestType } from '../../utils/workflowTemplates.js';
import { describeWorkflowStatus } from '../../utils/workflow.js';
import { formatDate } from '../../utils/format.js';

export default function AdviserRequests() {
  const { adviserId, workflows } = useAdviserWorkflows();
  const requests = useServiceQuery(() => (adviserId ? listServiceRequests({ adviserId }) : []), [adviserId]);
  const { clientName, providerName } = useLookups();
  const workflowFor = (id) => workflows.data?.find((w) => w.id === id);

  return (
    <>
      <PageHeader title="Client requests" description="Requests from the Client Service Centre. Each one runs as a workflow." />
      <QueryState query={requests} loadingLabel="Loading requests">
        {(list) =>
          list.length ? (
            <ul className="divide-y divide-brand-border rounded-md border border-brand-border">
              {list.map((r) => {
                const w = workflowFor(r.workflowId);
                return (
                  <li key={r.id}>
                    <Link to={r.workflowId ? `/workflow/${r.workflowId}` : '#'} className="grid gap-2 p-4 hover:bg-brand-light-grey sm:grid-cols-[1fr_1fr_auto] sm:items-center">
                      <span>
                        <span className="block font-semibold">{getServiceRequestType(r.type)?.label || r.type}</span>
                        <span className="text-[15px] text-brand-grey">{clientName(r.clientId)}. Received {formatDate(r.createdAt)}</span>
                      </span>
                      <span className="text-[15.5px]">{w ? w.nextAction : ''}</span>
                      <StatusBadge tone={w?.status === 'completed' ? 'success' : w && ['adviser', 'system'].includes(w.currentOwner) ? 'action' : 'neutral'}>
                        {w ? describeWorkflowStatus(w, { providerName: providerName(w.providerId), clientName: clientName(w.clientId) }) : r.status}
                      </StatusBadge>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <EmptyState title="No requests" message="Client requests will appear here." />
          )
        }
      </QueryState>
    </>
  );
}
