import { Link } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader.jsx';
import Section from '../../components/common/Section.jsx';
import { QueryState, EmptyState } from '../../components/common/States.jsx';
import ActionList from '../../components/dashboard/ActionList.jsx';
import NetWorthSummary from '../../components/dashboard/NetWorthSummary.jsx';
import GoalCard from '../../components/goals/GoalCard.jsx';
import WorkflowCard from '../../components/workflows/WorkflowCard.jsx';
import { useCurrentClient } from '../../hooks/useCurrentUser.js';
import { useServiceQuery } from '../../hooks/useServiceQuery.js';
import { useLookups } from '../../hooks/useLookups.js';
import { listTasks } from '../../services/taskService.js';
import { listWorkflows } from '../../services/workflowService.js';
import { listGoals } from '../../services/goalService.js';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function ClientDashboard() {
  const client = useCurrentClient();
  const clientId = client.data?.id;
  const tasks = useServiceQuery(() => (clientId ? listTasks({ clientId, assignee: 'client' }) : []), [clientId], { dependsOn: client });
  const workflows = useServiceQuery(() => (clientId ? listWorkflows({ clientId, includeCompleted: false }) : []), [clientId], { dependsOn: client });
  const goals = useServiceQuery(() => (clientId ? listGoals({ clientId }) : []), [clientId], { dependsOn: client });
  const { providerName } = useLookups();

  return (
    <>
      <PageHeader
        title={`${greeting()}${client.data ? `, ${client.data.firstName}` : ''}`}
        description="Here's what needs you today and where everything else stands."
      />

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div>
          <Section title="Action required" count={tasks.data?.length} action={<Link to="/client/actions" className="text-[14px] font-semibold text-brand-red hover:underline">All actions</Link>}>
            <QueryState query={tasks} loadingLabel="Loading your actions">
              {(list) => <ActionList tasks={list.slice(0, 4)} emptyTitle="You're up to date" />}
            </QueryState>
          </Section>

          <Section title="Active processes" count={workflows.data?.length}>
            <QueryState query={workflows} loadingLabel="Loading your processes">
              {(list) =>
                list.length ? (
                  <div className="space-y-3">
                    {list.map((w) => (
                      <WorkflowCard key={w.id} workflow={w} providerName={providerName(w.providerId)} viewerRole="client" />
                    ))}
                  </div>
                ) : (
                  <EmptyState title="No active processes" message="When you make a request or report a claim, you can track it here." />
                )
              }
            </QueryState>
          </Section>
        </div>

        <aside className="space-y-6">
          {client.data && <NetWorthSummary assets={client.data.totalAssets} liabilities={client.data.totalLiabilities} />}
          <div>
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="text-lg font-medium">Goals</h2>
              <Link to="/client/goals" className="text-[14px] font-semibold text-brand-red hover:underline">View goals</Link>
            </div>
            <QueryState query={goals} loadingLabel="Loading goals">
              {(list) => (
                <div className="space-y-3">
                  {list.map((g) => (
                    <GoalCard key={g.id} goal={g} compact />
                  ))}
                </div>
              )}
            </QueryState>
          </div>
        </aside>
      </div>
    </>
  );
}
