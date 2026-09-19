import PageHeader from '../../components/common/PageHeader.jsx';
import Section from '../../components/common/Section.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import { QueryState, EmptyState } from '../../components/common/States.jsx';
import WorkflowCard from '../../components/workflows/WorkflowCard.jsx';
import { useAdviserWorkflows } from '../../hooks/useAdviserData.js';
import { useServiceQuery } from '../../hooks/useServiceQuery.js';
import { useLookups } from '../../hooks/useLookups.js';
import { listClaims } from '../../services/claimService.js';

export default function AdviserClaims() {
  const { adviserId, workflows } = useAdviserWorkflows();
  const claims = useServiceQuery(() => (adviserId ? listClaims({ adviserId }) : []), [adviserId]);
  const { clientName, providerName } = useLookups();
  const claimFor = (workflowId) => claims.data?.find((c) => c.workflowId === workflowId);

  return (
    <>
      <PageHeader title="Claims" description="Motor claims from Accident Assist, from first report to closure." />
      <Section title="Claims" count={(workflows.data || []).filter((w) => w.type === 'motor_claim').length}>
        <QueryState query={workflows} loadingLabel="Loading claims">
          {(list) => {
            const motor = list.filter((w) => w.type === 'motor_claim');
            return motor.length ? (
              <div className="space-y-3">
                {motor.map((w) => {
                  const claim = claimFor(w.id);
                  return (
                    <div key={w.id}>
                      {claim && (
                        <p className="mb-1.5 flex flex-wrap items-center gap-2 text-[15px] text-brand-grey">
                          <span className="tabular-nums">{claim.claimNumber || 'Claim number pending'}</span>
                          <span>{claim.location}</span>
                          {claim.capturedOffline && <StatusBadge tone="warning">Captured offline</StatusBadge>}
                        </p>
                      )}
                      <WorkflowCard workflow={w} clientName={clientName(w.clientId)} providerName={providerName(w.providerId)} viewerRole="adviser" />
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState title="No claims" message="Claims appear here when a client uses Accident Assist." />
            );
          }}
        </QueryState>
      </Section>
    </>
  );
}
