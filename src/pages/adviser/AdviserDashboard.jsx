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
import { useI18n } from '../../i18n/I18nContext.jsx';

function Count({ label, value, tone }) {
  return (
    <div className="rounded-md border border-brand-border p-4">
      <p className="text-[13px] text-brand-grey">{label}</p>
      <p className={`font-display text-[28px] font-light tabular-nums ${tone === 'red' && value ? 'text-brand-red' : ''}`}>{value}</p>
    </div>
  );
}

/** Adviser home: the inbox first, a short task list second. Deliberately not an analytics dashboard. */
export default function AdviserDashboard() {
  const { t } = useI18n();
  const { adviser, adviserId, workflows } = useAdviserWorkflows({ includeCompleted: false });
  const tasks = useServiceQuery(() => (adviserId ? listTasks({ adviserId, assignee: 'adviser' }) : []), [adviserId]);
  const { clientName } = useLookups();
  const groups = groupWorkflowsForInbox(workflows.data || []);

  return (
    <>
      <PageHeader
        title={adviser.data ? t('adviser.dashboard.hello', { name: adviser.data.name.split(' ')[0] }) : t('nav.dashboard')}
        description={t('adviser.dashboard.description')}
        actions={<Link to="/adviser/actions" className="text-[14px] font-semibold text-brand-red hover:underline">{t('adviser.dashboard.openInbox')}</Link>}
      />
      <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Count label={t('inbox.group.overdue')} value={groups.overdue.length} tone="red" />
        <Count label={t('inbox.group.needsMe')} value={groups.needsMe.length} />
        <Count label={t('inbox.group.waitingOnClient')} value={groups.waitingOnClient.length} />
        <Count label={t('inbox.group.waitingOnProvider')} value={groups.waitingOnProvider.length} />
      </div>
      <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div>
          <QueryState query={workflows} loadingLabel={t('inbox.loading')}>
            {(list) => <InboxGroups workflows={list} only={['overdue', 'needsMe']} />}
          </QueryState>
        </div>
        <aside>
          <Section title={t('adviser.dashboard.myTasks')} count={tasks.data?.length}>
            <QueryState query={tasks}>
              {(list) => <ActionList tasks={list.slice(0, 6)} clientName={clientName} onComplete={completeTask} emptyTitle={t('adviser.dashboard.noTasks')} />}
            </QueryState>
          </Section>
        </aside>
      </div>
    </>
  );
}
