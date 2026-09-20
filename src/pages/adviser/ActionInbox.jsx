import PageHeader from '../../components/common/PageHeader.jsx';
import Section from '../../components/common/Section.jsx';
import { QueryState, EmptyState } from '../../components/common/States.jsx';
import InboxItem from '../../components/adviser/InboxItem.jsx';
import { useAdviserWorkflows } from '../../hooks/useAdviserData.js';
import { useLookups } from '../../hooks/useLookups.js';
import { groupWorkflowsForInbox } from '../../utils/workflow.js';
import { useI18n } from '../../i18n/I18nContext.jsx';

// Titles and empty messages are i18n keys: inbox.group.<key> and inbox.empty.<key>.
const ACCENT = { needsMe: 'border-l-4 border-l-brand-red', waitingOnClient: 'border-l-4 border-l-gold-deep', waitingOnProvider: 'border-l-4 border-l-brand-grey' };
export const INBOX_GROUPS = [{ key: 'overdue' }, { key: 'needsMe' }, { key: 'waitingOnClient' }, { key: 'waitingOnProvider' }];

export function InboxGroups({ workflows, only }) {
  const { t } = useI18n();
  const { clientName, providerName } = useLookups();
  const groups = groupWorkflowsForInbox(workflows);
  return INBOX_GROUPS.filter((g) => !only || only.includes(g.key)).map((g) => (
    <Section key={g.key} title={t(`inbox.group.${g.key}`)} count={groups[g.key].length}>
      {groups[g.key].length ? (
        <ul className={`divide-y divide-brand-border rounded-lg bg-surface shadow-card border ${g.key === 'overdue' ? 'border-2 border-danger' : `border-brand-border ${ACCENT[g.key] || ''}`}`}>
          {groups[g.key].map((w) => (
            <InboxItem key={w.id} workflow={w} clientName={clientName(w.clientId)} providerName={providerName(w.providerId)} />
          ))}
        </ul>
      ) : (
        <p className="rounded-md border border-dashed border-brand-border bg-surface p-4 text-[15.5px] text-text-secondary">{t(`inbox.empty.${g.key}`)}</p>
      )}
    </Section>
  ));
}

export default function ActionInbox() {
  const { t } = useI18n();
  const { workflows } = useAdviserWorkflows({ includeCompleted: false });
  return (
    <>
      <PageHeader title={t('inbox.title')} description={t('inbox.description')} />
      <QueryState query={workflows} loadingLabel={t('inbox.loading')}>
        {(list) => (list.length ? <InboxGroups workflows={list} /> : <EmptyState title={t('inbox.zero')} message={t('inbox.zeroHint')} />)}
      </QueryState>
    </>
  );
}
