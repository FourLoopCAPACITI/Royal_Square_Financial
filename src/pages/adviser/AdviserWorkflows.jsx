import { useState } from 'react';
import PageHeader from '../../components/common/PageHeader.jsx';
import { QueryState, EmptyState } from '../../components/common/States.jsx';
import WorkflowCard from '../../components/workflows/WorkflowCard.jsx';
import { useAdviserWorkflows } from '../../hooks/useAdviserData.js';
import { useLookups } from '../../hooks/useLookups.js';
import { WORKFLOW_TEMPLATES } from '../../utils/workflowTemplates.js';
import { useI18n } from '../../i18n/I18nContext.jsx';

// Labels are i18n keys: workflows.filter.<key>.
const OWNER_FILTERS = ['all', 'adviser', 'client', 'provider', 'completed'];

export default function AdviserWorkflows() {
  const { t, tx } = useI18n();
  const { workflows } = useAdviserWorkflows();
  const { clientName, providerName } = useLookups();
  const [owner, setOwner] = useState('all');
  const [type, setType] = useState('all');

  const matches = (w) => {
    if (type !== 'all' && w.type !== type) return false;
    if (owner === 'completed') return w.status === 'completed';
    if (w.status !== 'active') return false;
    if (owner === 'all') return true;
    if (owner === 'adviser') return ['adviser', 'system'].includes(w.currentOwner);
    if (owner === 'provider') return ['provider', 'repairer'].includes(w.currentOwner);
    return w.currentOwner === owner;
  };

  return (
    <>
      <PageHeader title={t('workflows.title')} description={t('workflows.description')} />
      <div className="mb-5 flex flex-wrap items-center gap-2">
        {OWNER_FILTERS.map((key) => (
          <button key={key} type="button" onClick={() => setOwner(key)} aria-pressed={owner === key} className={`rounded border px-3 py-1.5 text-[14px] font-semibold ${owner === key ? 'border-brand-red bg-action text-white' : 'border-brand-border hover:border-brand-black'}`}>
            {t(`workflows.filter.${key}`)}
          </button>
        ))}
        <label htmlFor="wf-type" className="sr-only">{t('workflows.type')}</label>
        <select id="wf-type" className="field ml-auto w-auto" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="all">{t('workflows.allTypes')}</option>
          {Object.entries(WORKFLOW_TEMPLATES).map(([key, tpl]) => <option key={key} value={key}>{tx(tpl.label)}</option>)}
        </select>
      </div>
      <QueryState query={workflows} loadingLabel={t('workflows.loading')}>
        {(list) => {
          const shown = list.filter(matches);
          return shown.length ? (
            <div className="grid gap-3 lg:grid-cols-2">
              {shown.map((w) => <WorkflowCard key={w.id} workflow={w} clientName={clientName(w.clientId)} providerName={providerName(w.providerId)} viewerRole="adviser" />)}
            </div>
          ) : (
            <EmptyState title={t('workflows.none')} message={t('workflows.noneHint')} />
          );
        }}
      </QueryState>
    </>
  );
}
