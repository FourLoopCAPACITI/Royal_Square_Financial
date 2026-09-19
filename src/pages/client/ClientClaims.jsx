import PageHeader from '../../components/common/PageHeader.jsx';
import Section from '../../components/common/Section.jsx';
import { QueryState, EmptyState } from '../../components/common/States.jsx';
import WorkflowCard from '../../components/workflows/WorkflowCard.jsx';
import { useCurrentClient } from '../../hooks/useCurrentUser.js';
import { useServiceQuery } from '../../hooks/useServiceQuery.js';
import { useLookups } from '../../hooks/useLookups.js';
import { listWorkflows } from '../../services/workflowService.js';

export default function ClientClaims() {
  const client = useCurrentClient();
  const clientId = client.data?.id;
  const claims = useServiceQuery(
    async () => (clientId ? (await listWorkflows({ clientId })).filter((w) => w.type === 'motor_claim') : []),
    [clientId], { dependsOn: client },
  );
  const { providerName } = useLookups();

  return (
    <>
      <PageHeader title="Claims" description="Report an incident and follow every step until your claim is closed." />
      <Section title="Your claims" count={claims.data?.length}>
        <QueryState query={claims} loadingLabel="Loading claims">
          {(list) =>
            list.length ? (
              <div className="space-y-3">
                {list.map((w) => (
                  <WorkflowCard key={w.id} workflow={w} providerName={providerName(w.providerId)} viewerRole="client" />
                ))}
              </div>
            ) : (
              <EmptyState title="No claims" message="If you're in an accident, Accident Assist walks you through what to capture." />
            )
          }
        </QueryState>
      </Section>
    </>
  );
}
