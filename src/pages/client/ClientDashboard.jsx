import { Link } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader.jsx';
import Section from '../../components/common/Section.jsx';
import { QueryState, EmptyState } from '../../components/common/States.jsx';
import ActionList from '../../components/dashboard/ActionList.jsx';
import NetWorthSummary from '../../components/dashboard/NetWorthSummary.jsx';
import GoalCard from '../../components/goals/GoalCard.jsx';
import WorkflowCard from '../../components/workflows/WorkflowCard.jsx';
import AccidentButton from '../../components/claims/AccidentButton.jsx';
import { useCurrentClient } from '../../hooks/useCurrentUser.js';
import { useServiceQuery } from '../../hooks/useServiceQuery.js';
import { useLookups } from '../../hooks/useLookups.js';
import { listTasks } from '../../services/taskService.js';
import { listWorkflows } from '../../services/workflowService.js';
import { listGoals } from '../../services/goalService.js';
import { useI18n } from '../../i18n/I18nContext.jsx';

function greeting(t) {
  const h = new Date().getHours();
  if (h < 12) return t('greeting.morning');
  if (h < 18) return t('greeting.afternoon');
  return t('greeting.evening');
}

export default function ClientDashboard() {
  const { t } = useI18n();
  const client = useCurrentClient();
  const clientId = client.data?.id;
  const tasks = useServiceQuery(() => (clientId ? listTasks({ clientId, assignee: 'client' }) : []), [clientId]);
  const workflows = useServiceQuery(() => (clientId ? listWorkflows({ clientId, includeCompleted: false }) : []), [clientId]);
  const goals = useServiceQuery(() => (clientId ? listGoals({ clientId }) : []), [clientId]);
  const { providerName } = useLookups();

  return (
    <>
      <PageHeader
        title={`${greeting(t)}${client.data ? `, ${client.data.firstName}` : ''}`}
        description={t('client.dashboard.description')}
        actions={<AccidentButton />}
      />

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div>
          <Section title={t('client.dashboard.actionRequired')} count={tasks.data?.length} action={<Link to="/client/actions" className="text-[14px] font-semibold text-brand-red hover:underline">{t('client.dashboard.allActions')}</Link>}>
            <QueryState query={tasks} loadingLabel={t('client.dashboard.loadingActions')}>
              {(list) => <ActionList tasks={list.slice(0, 4)} emptyTitle={t('client.dashboard.upToDate')} />}
            </QueryState>
          </Section>

          <Section title={t('client.dashboard.activeProcesses')} count={workflows.data?.length}>
            <QueryState query={workflows} loadingLabel={t('client.dashboard.loadingProcesses')}>
              {(list) =>
                list.length ? (
                  <div className="space-y-3">
                    {list.map((w) => (
                      <WorkflowCard key={w.id} workflow={w} providerName={providerName(w.providerId)} viewerRole="client" />
                    ))}
                  </div>
                ) : (
                  <EmptyState title={t('client.dashboard.noProcesses')} message={t('client.dashboard.noProcessesHint')} />
                )
              }
            </QueryState>
          </Section>
        </div>

        <aside className="space-y-6">
          {client.data && <NetWorthSummary assets={client.data.totalAssets} liabilities={client.data.totalLiabilities} />}
          <div>
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="text-lg font-medium">{t('client.dashboard.goals')}</h2>
              <Link to="/client/goals" className="text-[14px] font-semibold text-brand-red hover:underline">{t('client.dashboard.viewGoals')}</Link>
            </div>
            <QueryState query={goals} loadingLabel={t('client.dashboard.loadingGoals')}>
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
