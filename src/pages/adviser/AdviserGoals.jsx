import PageHeader from '../../components/common/PageHeader.jsx';
import { QueryState, EmptyState } from '../../components/common/States.jsx';
import GoalCard from '../../components/goals/GoalCard.jsx';
import { useCurrentAdviser } from '../../hooks/useCurrentUser.js';
import { useServiceQuery } from '../../hooks/useServiceQuery.js';
import { useLookups } from '../../hooks/useLookups.js';
import { listGoals } from '../../services/goalService.js';

export default function AdviserGoals() {
  const adviser = useCurrentAdviser();
  const adviserId = adviser.data?.id;
  const goals = useServiceQuery(() => (adviserId ? listGoals({ adviserId }) : []), [adviserId]);
  const { clientName } = useLookups();
  return (
    <>
      <PageHeader title="Goals" description="Client and household goals. Progress tracking only; advice happens in your review meetings." />
      <QueryState query={goals} loadingLabel="Loading goals">
        {(list) =>
          list.length ? (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {list.map((g) => (
                <GoalCard key={g.id} goal={g} ownerLabel={g.ownerType === 'household' ? 'Shared household goal' : clientName(g.clientId)} />
              ))}
            </div>
          ) : (
            <EmptyState title="No goals yet" />
          )
        }
      </QueryState>
    </>
  );
}
