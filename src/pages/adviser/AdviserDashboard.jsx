import { Link } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader.jsx';
import Section from '../../components/common/Section.jsx';
import { QueryState } from '../../components/common/States.jsx';
import ActionList from '../../components/dashboard/ActionList.jsx';
import { InboxGroups } from './ActionInbox.jsx';
import { useAdviserWorkflows } from '../../hooks/useAdviserData.js';
import { useServiceQuery } from '../../hooks/useServiceQuery.js';
import { useLookups } from '../../hooks/useLookups.js';
import { completeTask, listTasks } from '../../services/taskService.js';
import { groupWorkflowsForInbox } from '../../utils/workflow.js';

function Count({ label, value, tone }) {
  return (
    <div className="rounded-md border border-brand-border p-4">
      <p className="text-[14.5px] text-brand-grey">{label}</p>
      <p className={`font-display text-[28px] font-light tabular-nums ${tone === 'red' && value ? 'text-brand-red' : ''}`}>{value}</p>
    </div>
  );
}

/** Adviser home: the inbox first, a short task list second. Deliberately not an analytics dashboard. */
export default function AdviserDashboard() {
  const { adviser, adviserId, workflows } = useAdviserWorkflows({ includeCompleted: false });
  const tasks = useServiceQuery(() => (adviserId ? listTasks({ adviserId, assignee: 'adviser' }) : []), [adviserId]);
  const { clientName } = useLookups();
  const groups = groupWorkflowsForInbox(workflows.data || []);

  return (
    <>
      <PageHeader
        title={adviser.data ? `Hello, ${adviser.data.name.split(' ')[0]}` : 'Dashboard'}
        description="Who's holding the ball on every client process."
        actions={<Link to="/adviser/actions" className="text-[15.5px] font-semibold text-brand-red hover:underline">Open full inbox</Link>}
      />
      <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Count label="Overdue" value={groups.overdue.length} tone="red" />
        <Count label="Needs me" value={groups.needsMe.length} />
        <Count label="Waiting on client" value={groups.waitingOnClient.length} />
        <Count label="Waiting on provider" value={groups.waitingOnProvider.length} />
      </div>
      <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div>
          <QueryState query={workflows} loadingLabel="Loading your inbox">
            {(list) => <InboxGroups workflows={list} only={['overdue', 'needsMe']} />}
          </QueryState>
        </div>
        <aside>
          <Section title="My tasks" count={tasks.data?.length}>
            <QueryState query={tasks}>
              {(list) => <ActionList tasks={list.slice(0, 6)} clientName={clientName} onComplete={completeTask} emptyTitle="No open tasks" />}
            </QueryState>
          </Section>
        </aside>
      </div>
    </>
  );
}
