import PageHeader from '../../components/common/PageHeader.jsx';
import { QueryState, EmptyState } from '../../components/common/States.jsx';
import GoalCard from '../../components/goals/GoalCard.jsx';
import { useCurrentAdviser } from '../../hooks/useCurrentUser.js';
import { useServiceQuery } from '../../hooks/useServiceQuery.js';
import { useLookups } from '../../hooks/useLookups.js';
import { listGoals } from '../../services/goalService.js';
import { useI18n } from '../../i18n/I18nContext.jsx';

export default function AdviserGoals() {
  const { t } = useI18n();
  const adviser = useCurrentAdviser();
  const adviserId = adviser.data?.id;
  const goals = useServiceQuery(() => (adviserId ? listGoals({ adviserId }) : []), [adviserId], { dependsOn: adviser });
  const { clientName } = useLookups();
  return (
    <>
      <PageHeader title={t('goals.title')} description={t('goals.adviserDescription')} />
      <QueryState query={goals} loadingLabel={t('client.dashboard.loadingGoals')}>
        {(list) =>
          list.length ? (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {list.map((g) => (
                <GoalCard key={g.id} goal={g} ownerLabel={g.ownerType === 'household' ? t('goals.sharedHousehold') : clientName(g.clientId)} />
              ))}
            </div>
          ) : (
            <EmptyState title={t('goals.noneAdviser')} />
          )
        }
      </QueryState>
    </>
  );
}
