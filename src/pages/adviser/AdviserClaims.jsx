import PageHeader from '../../components/common/PageHeader.jsx';
import Section from '../../components/common/Section.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import { QueryState, EmptyState } from '../../components/common/States.jsx';
import WorkflowCard from '../../components/workflows/WorkflowCard.jsx';
import { useAdviserWorkflows } from '../../hooks/useAdviserData.js';
import { useServiceQuery } from '../../hooks/useServiceQuery.js';
import { useLookups } from '../../hooks/useLookups.js';
import { listClaims } from '../../services/claimService.js';
import { useI18n } from '../../i18n/I18nContext.jsx';

export default function AdviserClaims() {
  const { t, tx } = useI18n();
  const { adviser, adviserId, workflows } = useAdviserWorkflows();
  const claims = useServiceQuery(() => (adviserId ? listClaims({ adviserId }) : []), [adviserId], { dependsOn: adviser });
  const { clientName, providerName } = useLookups();
  const claimFor = (workflowId) => claims.data?.find((c) => c.workflowId === workflowId);

  return (
    <>
      <PageHeader title={t('claims.title')} description={t('claims.adviserDescription')} />
      <Section title={t('claims.title')} count={(workflows.data || []).filter((w) => w.type === 'motor_claim').length}>
        <QueryState query={workflows} loadingLabel={t('claims.loading')}>
          {(list) => {
            const motor = list.filter((w) => w.type === 'motor_claim');
            return motor.length ? (
              <div className="space-y-3">
                {motor.map((w) => {
                  const claim = claimFor(w.id);
                  return (
                    <div key={w.id}>
                      {claim && (
                        <p className="mb-1.5 flex flex-wrap items-center gap-2 text-[13.5px] text-brand-grey">
                          <span className="tabular-nums">{claim.claimNumber || t('claims.numberPending')}</span>
                          <span>{tx(claim.location)}</span>
                          {claim.capturedOffline && <StatusBadge tone="warning">{t('claims.capturedOffline')}</StatusBadge>}
                        </p>
                      )}
                      <WorkflowCard workflow={w} clientName={clientName(w.clientId)} providerName={providerName(w.providerId)} viewerRole="adviser" />
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState title={t('claims.none')} message={t('claims.noneAdviserHint')} />
            );
          }}
        </QueryState>
      </Section>
    </>
  );
}
