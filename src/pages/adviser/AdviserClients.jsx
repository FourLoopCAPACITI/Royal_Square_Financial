import { useState } from 'react';
import { Search } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import { QueryState, EmptyState } from '../../components/common/States.jsx';
import WorkflowCard from '../../components/workflows/WorkflowCard.jsx';
import { useAdviserWorkflows } from '../../hooks/useAdviserData.js';
import { useServiceQuery } from '../../hooks/useServiceQuery.js';
import { useLookups } from '../../hooks/useLookups.js';
import { listClients } from '../../services/clientService.js';
import { formatZAR } from '../../utils/format.js';
import { isWorkflowOverdue } from '../../utils/workflow.js';

export default function AdviserClients() {
  const { adviser, adviserId, workflows } = useAdviserWorkflows({ includeCompleted: false });
  const clients = useServiceQuery(() => (adviserId ? listClients({ adviserId }) : []), [adviserId], { dependsOn: adviser });
  const { providerName } = useLookups();
  const [query, setQuery] = useState('');
  const [openId, setOpenId] = useState(null);

  const active = workflows.data || [];
  const filter = (list) => list.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <>
      <PageHeader title="Clients" description="Your assigned clients and what's open for each." />
      <div className="relative mb-5 max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-grey" aria-hidden="true" />
        <label htmlFor="client-search" className="sr-only">Search clients</label>
        <input id="client-search" className="field pl-9" placeholder="Search clients" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>
      <QueryState query={clients} loadingLabel="Loading clients">
        {(list) =>
          filter(list).length ? (
            <ul className="divide-y divide-brand-border rounded-md border border-brand-border">
              {filter(list).map((c) => {
                const mine = active.filter((w) => w.clientId === c.id);
                const overdue = mine.filter((w) => isWorkflowOverdue(w)).length;
                const open = openId === c.id;
                return (
                  <li key={c.id}>
                    <button type="button" onClick={() => setOpenId(open ? null : c.id)} aria-expanded={open} className="grid w-full gap-2 p-4 text-left hover:bg-brand-light-grey sm:grid-cols-[1.2fr_1fr_auto] sm:items-center">
                      <span>
                        <span className="block font-semibold">{c.name}</span>
                        <span className="text-[13.5px] text-brand-grey">{c.occupation}. {c.city}</span>
                      </span>
                      <span className="text-[14px] tabular-nums text-brand-grey">Net worth {formatZAR(c.totalAssets - c.totalLiabilities)}</span>
                      <span className="flex gap-2">
                        {overdue > 0 && <StatusBadge status="overdue">{overdue} overdue</StatusBadge>}
                        <StatusBadge tone="neutral">{mine.length} open</StatusBadge>
                      </span>
                    </button>
                    {open && (
                      <div className="space-y-3 border-t border-brand-border bg-brand-light-grey p-4">
                        <p className="text-[14px] text-brand-grey">{c.email}. {c.phone}. {c.address}</p>
                        {mine.length ? mine.map((w) => <WorkflowCard key={w.id} workflow={w} providerName={providerName(w.providerId)} viewerRole="adviser" showOwner={false} />) : <p className="text-[14px]">No open processes.</p>}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <EmptyState title="No clients found" />
          )
        }
      </QueryState>
    </>
  );
}
