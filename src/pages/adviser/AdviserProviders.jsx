import PageHeader from '../../components/common/PageHeader.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import { QueryState } from '../../components/common/States.jsx';
import { useAdviserWorkflows } from '../../hooks/useAdviserData.js';
import { useServiceQuery } from '../../hooks/useServiceQuery.js';
import { listProviders } from '../../services/clientService.js';

/** Provider directory. All provider integrations in this starter are mock/demo only. */
export default function AdviserProviders() {
  const providers = useServiceQuery(() => listProviders(), []);
  const { workflows } = useAdviserWorkflows({ includeCompleted: false });
  const waitingOn = (id) => (workflows.data || []).filter((w) => w.providerId === id && w.currentOwner === 'provider').length;

  return (
    <>
      <PageHeader title="Providers" description="Insurers and investment houses Royal Square works with. Integrations are simulated in this prototype." />
      <QueryState query={providers} loadingLabel="Loading providers">
        {(list) => (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {list.map((p) => (
              <div key={p.id} className="rounded-md border border-brand-border p-5">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-display text-[18px] font-medium">{p.name}</p>
                  <StatusBadge tone="neutral">{p.integration === 'mock' ? 'Mock integration' : p.integration}</StatusBadge>
                </div>
                <p className="text-[14px] text-brand-grey">{p.category}</p>
                <dl className="mt-4 grid grid-cols-2 gap-2 text-[14px]">
                  <dt className="text-brand-grey">Waiting on them</dt>
                  <dd className={`font-semibold ${waitingOn(p.id) ? 'text-brand-red' : ''}`}>{waitingOn(p.id)}</dd>
                  <dt className="text-brand-grey">Typical response</dt>
                  <dd>{p.avgResponseDays ? `${p.avgResponseDays} days` : '—'}</dd>
                  <dt className="text-brand-grey">Contact</dt>
                  <dd className="break-all">{p.contact || '—'}</dd>
                </dl>
              </div>
            ))}
          </div>
        )}
      </QueryState>
    </>
  );
}
