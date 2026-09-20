import PageHeader from '../../components/common/PageHeader.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import { QueryState } from '../../components/common/States.jsx';
import { useAdviserWorkflows } from '../../hooks/useAdviserData.js';
import { useServiceQuery } from '../../hooks/useServiceQuery.js';
import { listProviders } from '../../services/clientService.js';
import { useI18n } from '../../i18n/I18nContext.jsx';

/** Provider directory. All provider integrations in this starter are mock/demo only. */
export default function AdviserProviders() {
  const { t, tx } = useI18n();
  const providers = useServiceQuery(() => listProviders(), []);
  const { workflows } = useAdviserWorkflows({ includeCompleted: false });
  const waitingOn = (id) => (workflows.data || []).filter((w) => w.providerId === id && w.currentOwner === 'provider').length;

  return (
    <>
      <PageHeader title={t('providers.title')} description={t('providers.description')} />
      <QueryState query={providers} loadingLabel={t('providers.loading')}>
        {(list) => (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {list.map((p) => (
              <div key={p.id} className="rounded-lg border border-brand-border bg-surface shadow-card p-5">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-display text-[19px] font-medium">{p.name}</p>
                  <StatusBadge tone="neutral">{p.integration === 'mock' ? t('providers.mock') : p.integration}</StatusBadge>
                </div>
                <p className="text-[15.5px] text-brand-grey">{tx(p.category)}</p>
                <dl className="mt-4 grid grid-cols-2 gap-2 text-[15.5px]">
                  <dt className="text-brand-grey">{t('providers.waiting')}</dt>
                  <dd className={`font-semibold ${waitingOn(p.id) ? 'text-danger' : ''}`}>{waitingOn(p.id)}</dd>
                  <dt className="text-brand-grey">{t('providers.response')}</dt>
                  <dd>{p.avgResponseDays ? t('providers.responseDays', { count: p.avgResponseDays }) : '—'}</dd>
                  <dt className="text-brand-grey">{t('providers.contact')}</dt>
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
