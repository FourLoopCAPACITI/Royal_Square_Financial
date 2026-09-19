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
import { useI18n } from '../../i18n/I18nContext.jsx';

export default function ClientActions() {
  const { t, tx } = useI18n();
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
      <PageHeader title={t('client.actions.title')} description={t('client.actions.description')} />

      <Section title={t('client.actions.todo')} count={tasks.data?.length}>
        <QueryState query={tasks}>
          {(list) => <ActionList tasks={list} onComplete={completeTask} emptyTitle={t('client.dashboard.upToDate')} />}
        </QueryState>
      </Section>

      <Section title={t('client.actions.waiting')} count={waiting.data?.length}>
        <QueryState query={waiting}>
          {(list) =>
            list.length ? (
              <div className="grid gap-3 md:grid-cols-2">
                {list.map((w) => (
                  <WorkflowCard key={w.id} workflow={w} providerName={providerName(w.providerId)} viewerRole="client" showOwner={false} />
                ))}
              </div>
            ) : (
              <EmptyState title={t('client.actions.nothingWaiting')} message={t('client.actions.nothingWaitingHint')} />
            )
          }
        </QueryState>
      </Section>

      <Section title={t('client.actions.reminders')} count={reminders.data?.length}>
        <QueryState query={reminders}>
          {(list) =>
            list.length ? (
              <ul className="divide-y divide-brand-border rounded-md border border-brand-border">
                {list.map((r) => (
                  <li key={r.id} className="flex justify-between gap-4 p-4 text-[15px]">
                    <span>{tx(r.title)}</span>
                    <span className="text-brand-grey">{t('client.actions.reminderLine', { date: formatDate(r.remindAt), channel: t(`channel.${r.channel}`) })}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState title={t('client.actions.noReminders')} />
            )
          }
        </QueryState>
      </Section>
    </>
  );
}
