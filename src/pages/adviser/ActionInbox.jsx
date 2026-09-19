import PageHeader from '../../components/common/PageHeader.jsx';
import Section from '../../components/common/Section.jsx';
import { QueryState, EmptyState } from '../../components/common/States.jsx';
import InboxItem from '../../components/adviser/InboxItem.jsx';
import { useAdviserWorkflows } from '../../hooks/useAdviserData.js';
import { useLookups } from '../../hooks/useLookups.js';
import { groupWorkflowsForInbox } from '../../utils/workflow.js';

export const INBOX_GROUPS = [
  { key: 'overdue', title: 'Overdue', empty: 'Nothing is overdue.' },
  { key: 'needsMe', title: 'Needs me', empty: 'Nothing is waiting on you right now.' },
  { key: 'waitingOnClient', title: 'Waiting on client', empty: 'No clients owe you anything.' },
  { key: 'waitingOnProvider', title: 'Waiting on provider', empty: 'Nothing is with a provider.' },
];

export function InboxGroups({ workflows, only }) {
  const { clientName, providerName } = useLookups();
  const groups = groupWorkflowsForInbox(workflows);
  return INBOX_GROUPS.filter((g) => !only || only.includes(g.key)).map((g) => (
    <Section key={g.key} title={g.title} count={groups[g.key].length}>
      {groups[g.key].length ? (
        <ul className={`divide-y divide-brand-border rounded-md border ${g.key === 'overdue' ? 'border-brand-red' : 'border-brand-border'}`}>
          {groups[g.key].map((w) => (
            <InboxItem key={w.id} workflow={w} clientName={clientName(w.clientId)} providerName={providerName(w.providerId)} />
          ))}
        </ul>
      ) : (
        <p className="rounded-md border border-dashed border-brand-border p-4 text-[15.5px] text-brand-grey">{g.empty}</p>
      )}
    </Section>
  ));
}

export default function ActionInbox() {
  const { workflows } = useAdviserWorkflows({ includeCompleted: false });
  return (
    <>
      <PageHeader title="Action Inbox" description="Every active process, grouped by who is holding the ball." />
      <QueryState query={workflows} loadingLabel="Loading your inbox">
        {(list) => (list.length ? <InboxGroups workflows={list} /> : <EmptyState title="Inbox zero" message="No active processes for your clients." />)}
      </QueryState>
    </>
  );
}
