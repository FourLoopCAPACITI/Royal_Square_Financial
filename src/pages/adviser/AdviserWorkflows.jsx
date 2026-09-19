import { useState } from 'react';
import PageHeader from '../../components/common/PageHeader.jsx';
import { QueryState, EmptyState } from '../../components/common/States.jsx';
import WorkflowCard from '../../components/workflows/WorkflowCard.jsx';
import { useAdviserWorkflows } from '../../hooks/useAdviserData.js';
import { useLookups } from '../../hooks/useLookups.js';
import { WORKFLOW_TEMPLATES } from '../../utils/workflowTemplates.js';

const OWNER_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'adviser', label: 'Royal Square' },
  { key: 'client', label: 'Client' },
  { key: 'provider', label: 'Provider' },
  { key: 'completed', label: 'Completed' },
];

export default function AdviserWorkflows() {
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
      <PageHeader title="Workflows" description="Every process runs on the same workflow engine. Filter by owner or type." />
      <div className="mb-5 flex flex-wrap items-center gap-2">
        {OWNER_FILTERS.map((f) => (
          <button key={f.key} type="button" onClick={() => setOwner(f.key)} aria-pressed={owner === f.key} className={`rounded border px-3 py-1.5 text-[14px] font-semibold ${owner === f.key ? 'border-brand-red bg-action text-white' : 'border-brand-border hover:border-brand-black'}`}>
            {f.label}
          </button>
        ))}
        <label htmlFor="wf-type" className="sr-only">Workflow type</label>
        <select id="wf-type" className="field ml-auto w-auto" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="all">All types</option>
          {Object.entries(WORKFLOW_TEMPLATES).map(([key, t]) => <option key={key} value={key}>{t.label}</option>)}
        </select>
      </div>
      <QueryState query={workflows} loadingLabel="Loading workflows">
        {(list) => {
          const shown = list.filter(matches);
          return shown.length ? (
            <div className="grid gap-3 lg:grid-cols-2">
              {shown.map((w) => <WorkflowCard key={w.id} workflow={w} clientName={clientName(w.clientId)} providerName={providerName(w.providerId)} viewerRole="adviser" />)}
            </div>
          ) : (
            <EmptyState title="No workflows match" message="Try a different filter." />
          );
        }}
      </QueryState>
    </>
  );
}
