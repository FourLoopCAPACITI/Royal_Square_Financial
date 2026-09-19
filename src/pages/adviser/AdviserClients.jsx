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
import { useI18n } from '../../i18n/I18nContext.jsx';

export default function AdviserClients() {
  const { t, tx } = useI18n();
  const { adviser, adviserId, workflows } = useAdviserWorkflows({ includeCompleted: false });
  const clients = useServiceQuery(() => (adviserId ? listClients({ adviserId }) : []), [adviserId], { dependsOn: adviser });
  const { providerName } = useLookups();
  const [query, setQuery] = useState('');
  const [openId, setOpenId] = useState(null);

  const active = workflows.data || [];
  const filter = (list) => list.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <>
      <PageHeader title={t('clients.title')} description={t('clients.description')} />
      <div className="relative mb-5 max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-grey" aria-hidden="true" />
        <label htmlFor="client-search" className="sr-only">{t('clients.search')}</label>
        <input id="client-search" className="field pl-9" placeholder={t('clients.search')} value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>
      <QueryState query={clients} loadingLabel={t('clients.loading')}>
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
                        <span className="text-[13.5px] text-brand-grey">{tx(c.occupation)}. {c.city}</span>
                      </span>
                      <span className="text-[14px] tabular-nums text-brand-grey">{t('clients.netWorth', { amount: formatZAR(c.totalAssets - c.totalLiabilities) })}</span>
                      <span className="flex gap-2">
                        {overdue > 0 && <StatusBadge status="overdue">{t('clients.overdue', { count: overdue })}</StatusBadge>}
                        <StatusBadge tone="neutral">{t('clients.open', { count: mine.length })}</StatusBadge>
                      </span>
                    </button>
                    {open && (
                      <div className="space-y-3 border-t border-brand-border bg-brand-light-grey p-4">
                        <p className="text-[14px] text-brand-grey">{c.email}. {c.phone}. {c.address}</p>
                        {mine.length ? mine.map((w) => <WorkflowCard key={w.id} workflow={w} providerName={providerName(w.providerId)} viewerRole="adviser" showOwner={false} />) : <p className="text-[14px]">{t('clients.noOpen')}</p>}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <EmptyState title={t('clients.none')} />
          )
        }
      </QueryState>
    </>
  );
}
