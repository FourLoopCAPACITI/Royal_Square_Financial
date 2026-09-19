import PageHeader from '../../components/common/PageHeader.jsx';
import Section from '../../components/common/Section.jsx';
import { QueryState, EmptyState } from '../../components/common/States.jsx';
import GoalCard from '../../components/goals/GoalCard.jsx';
import { useCurrentClient } from '../../hooks/useCurrentUser.js';
import { useServiceQuery } from '../../hooks/useServiceQuery.js';
import { listGoals } from '../../services/goalService.js';
import { getHousehold, lookupClientName } from '../../services/clientService.js';
import { useI18n } from '../../i18n/I18nContext.jsx';

export default function ClientGoals() {
  const { t } = useI18n();
  const client = useCurrentClient();
  const clientId = client.data?.id;
  const goals = useServiceQuery(() => (clientId ? listGoals({ clientId }) : []), [clientId], { dependsOn: client });
  const household = useServiceQuery(() => getHousehold(client.data?.householdId), [client.data?.householdId], { dependsOn: client });

  const members = household.data?.memberIds?.map((id) => lookupClientName(id)).filter(Boolean).join(` ${t('common.and')} `);

  return (
    <>
      <PageHeader title={t('goals.title')} description={t('goals.clientDescription')} />
      <QueryState query={goals}>
        {(list) => {
          const personal = list.filter((g) => g.ownerType === 'client');
          const shared = list.filter((g) => g.ownerType === 'household');
          return (
            <>
              <Section title={t('goals.yours')} count={personal.length}>
                {personal.length ? (
                  <div className="grid gap-3 md:grid-cols-2">{personal.map((g) => <GoalCard key={g.id} goal={g} />)}</div>
                ) : (
                  <EmptyState title={t('goals.noneYours')} message={t('goals.noneYoursHint')} />
                )}
              </Section>
              <Section title={t('goals.shared')} count={shared.length}>
                {shared.length ? (
                  <div className="grid gap-3 md:grid-cols-2">
                    {shared.map((g) => <GoalCard key={g.id} goal={g} ownerLabel={members ? t('goals.sharedBy', { members }) : t('goals.sharedHousehold')} />)}
                  </div>
                ) : (
                  <EmptyState title={t('goals.noneShared')} message={t('goals.noneSharedHint')} />
                )}
              </Section>
            </>
          );
        }}
      </QueryState>
      <p className="text-[13px] text-brand-grey">{t('goals.disclaimer')}</p>
    </>
  );
}
