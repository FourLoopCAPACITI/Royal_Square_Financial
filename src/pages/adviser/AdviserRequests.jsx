import { Link } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import { QueryState, EmptyState } from '../../components/common/States.jsx';
import { useAdviserWorkflows } from '../../hooks/useAdviserData.js';
import { useServiceQuery } from '../../hooks/useServiceQuery.js';
import { useLookups } from '../../hooks/useLookups.js';
import { listServiceRequests } from '../../services/requestService.js';
import { getServiceRequestType } from '../../utils/workflowTemplates.js';
import { describeWorkflowStatus } from '../../utils/workflow.js';
import { formatDate } from '../../utils/format.js';
import { useI18n } from '../../i18n/I18nContext.jsx';

export default function AdviserRequests() {
  const { t, tx } = useI18n();
  const { adviser, adviserId, workflows } = useAdviserWorkflows();
  const requests = useServiceQuery(() => (adviserId ? listServiceRequests({ adviserId }) : []), [adviserId], { dependsOn: adviser });
  const { clientName, providerName } = useLookups();
  const workflowFor = (id) => workflows.data?.find((w) => w.id === id);

  return (
    <>
      <PageHeader title={t('requests.adviserTitle')} description={t('requests.adviserDescription')} />
      <QueryState query={requests} loadingLabel={t('requests.loading')}>
        {(list) =>
          list.length ? (
            <ul className="divide-y divide-brand-border rounded-lg border border-brand-border bg-surface shadow-card">
              {list.map((r) => {
                const w = workflowFor(r.workflowId);
                return (
                  <li key={r.id}>
                    <Link to={r.workflowId ? `/workflow/${r.workflowId}` : '#'} className="grid gap-2 p-4 hover:bg-brand-light-grey sm:grid-cols-[1fr_1fr_auto] sm:items-center">
                      <span>
                        <span className="block font-semibold">{tx(getServiceRequestType(r.type)?.label || r.type)}</span>
                        <span className="text-[15px] text-brand-grey">{t('requests.received', { client: clientName(r.clientId), date: formatDate(r.createdAt) })}</span>
                      </span>
                      <span className="text-[15.5px]">{w ? tx(w.nextAction) : ''}</span>
                      <StatusBadge tone={w?.status === 'completed' ? 'success' : w && ['adviser', 'system'].includes(w.currentOwner) ? 'action' : 'neutral'}>
                        {w ? describeWorkflowStatus(w, { providerName: providerName(w.providerId), clientName: clientName(w.clientId) }) : tx(r.status)}
                      </StatusBadge>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <EmptyState title={t('requests.adviserNone')} message={t('requests.adviserNoneHint')} />
          )
        }
      </QueryState>
    </>
  );
}
