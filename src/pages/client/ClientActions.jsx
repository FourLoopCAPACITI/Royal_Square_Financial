import PageHeader from '../../components/common/PageHeader.jsx';
import Section from '../../components/common/Section.jsx';
import { QueryState, EmptyState } from '../../components/common/States.jsx';
import ActionList from '../../components/dashboard/ActionList.jsx';
import WorkflowCard from '../../components/workflows/WorkflowCard.jsx';
import { useCurrentClient } from '../../hooks/useCurrentUser.js';
import { useServiceQuery } from '../../hooks/useServiceQuery.js';
import { useLookups } from '../../hooks/useLookups.js';
import { completeTask, listReminders, listTasks } from '../../services/taskService.js';
import { listWorkflows } from '../../services/workflowService.js';
import { formatDate } from '../../utils/format.js';

export default function ClientActions() {
  const client = useCurrentClient();
  const clientId = client.data?.id;
  const tasks = useServiceQuery(() => (clientId ? listTasks({ clientId, assignee: 'client' }) : []), [clientId]);
  const waiting = useServiceQuery(
    async () => (clientId ? (await listWorkflows({ clientId, includeCompleted: false })).filter((w) => w.currentOwner === 'client') : []),
    [clientId],
  );
  const reminders = useServiceQuery(() => (clientId ? listReminders({ clientId }) : []), [clientId]);
  const { providerName } = useLookups();

  return (
    <>
      <PageHeader title="My actions" description="Everything that is waiting on you, in one list." />

      <Section title="To do" count={tasks.data?.length}>
        <QueryState query={tasks}>
          {(list) => <ActionList tasks={list} onComplete={completeTask} emptyTitle="You're up to date" />}
        </QueryState>
      </Section>

      <Section title="Processes waiting on you" count={waiting.data?.length}>
        <QueryState query={waiting}>
          {(list) =>
            list.length ? (
              <div className="grid gap-3 md:grid-cols-2">
                {list.map((w) => (
                  <WorkflowCard key={w.id} workflow={w} providerName={providerName(w.providerId)} viewerRole="client" showOwner={false} />
                ))}
              </div>
            ) : (
              <EmptyState title="Nothing is waiting on you" message="Royal Square and your providers are handling everything in progress." />
            )
          }
        </QueryState>
      </Section>

      <Section title="Scheduled reminders" count={reminders.data?.length}>
        <QueryState query={reminders}>
          {(list) =>
            list.length ? (
              <ul className="divide-y divide-brand-border rounded-md border border-brand-border">
                {list.map((r) => (
                  <li key={r.id} className="flex justify-between gap-4 p-4 text-[16.5px]">
                    <span>{r.title}</span>
                    <span className="text-brand-grey">{formatDate(r.remindAt)} by {r.channel}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState title="No reminders scheduled" />
            )
          }
        </QueryState>
      </Section>
    </>
  );
}
