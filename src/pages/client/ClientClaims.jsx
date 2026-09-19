import PageHeader from '../../components/common/PageHeader.jsx';
import Section from '../../components/common/Section.jsx';
import { QueryState, EmptyState } from '../../components/common/States.jsx';
import WorkflowCard from '../../components/workflows/WorkflowCard.jsx';
import { useCurrentClient } from '../../hooks/useCurrentUser.js';
import { useServiceQuery } from '../../hooks/useServiceQuery.js';
import { useLookups } from '../../hooks/useLookups.js';
import { listWorkflows } from '../../services/workflowService.js';
import { useI18n } from '../../i18n/I18nContext.jsx';

export default function ClientClaims() {
  const { t } = useI18n();
  const client = useCurrentClient();
  const clientId = client.data?.id;
  const claims = useServiceQuery(
    async () => (clientId ? (await listWorkflows({ clientId })).filter((w) => w.type === 'motor_claim') : []),
    [clientId], { dependsOn: client },
  );
  const { providerName } = useLookups();

  return (
    <>
      <PageHeader title={t('claims.title')} description={t('claims.clientDescription')} />
      <Section title={t('claims.yours')} count={claims.data?.length}>
        <QueryState query={claims} loadingLabel={t('claims.loading')}>
          {(list) =>
            list.length ? (
              <div className="space-y-3">
                {list.map((w) => (
                  <WorkflowCard key={w.id} workflow={w} providerName={providerName(w.providerId)} viewerRole="client" />
                ))}
              </div>
            ) : (
              <EmptyState title={t('claims.none')} message={t('claims.noneHint')} />
            )
          }
        </QueryState>
      </Section>
    </>
  );
}
