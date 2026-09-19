import PageHeader from '../../components/common/PageHeader.jsx';
import Section from '../../components/common/Section.jsx';
import { QueryState, EmptyState } from '../../components/common/States.jsx';
import GoalCard from '../../components/goals/GoalCard.jsx';
import { useCurrentClient } from '../../hooks/useCurrentUser.js';
import { useServiceQuery } from '../../hooks/useServiceQuery.js';
import { listGoals } from '../../services/goalService.js';
import { getHousehold, lookupClientName } from '../../services/clientService.js';

export default function ClientGoals() {
  const client = useCurrentClient();
  const clientId = client.data?.id;
  const goals = useServiceQuery(() => (clientId ? listGoals({ clientId }) : []), [clientId]);
  const household = useServiceQuery(() => getHousehold(client.data?.householdId), [client.data?.householdId]);

  const members = household.data?.memberIds?.map((id) => lookupClientName(id)).filter(Boolean).join(' and ');

  return (
    <>
      <PageHeader title="Goals" description="Track what you're saving towards. Speak to your adviser about how to reach them." />
      <QueryState query={goals}>
        {(list) => {
          const personal = list.filter((g) => g.ownerType === 'client');
          const shared = list.filter((g) => g.ownerType === 'household');
          return (
            <>
              <Section title="Your goals" count={personal.length}>
                {personal.length ? (
                  <div className="grid gap-3 md:grid-cols-2">{personal.map((g) => <GoalCard key={g.id} goal={g} />)}</div>
                ) : (
                  <EmptyState title="No personal goals yet" message="Your adviser can set up goals with you at your next review." />
                )}
              </Section>
              <Section title="Shared household goals" count={shared.length}>
                {shared.length ? (
                  <div className="grid gap-3 md:grid-cols-2">
                    {shared.map((g) => <GoalCard key={g.id} goal={g} ownerLabel={members ? `Shared by ${members}` : 'Shared household goal'} />)}
                  </div>
                ) : (
                  <EmptyState title="No shared goals" message="Household goals let partners track one target together." />
                )}
              </Section>
            </>
          );
        }}
      </QueryState>
      <p className="text-[13px] text-brand-grey">Goals show progress only. Royal Square doesn't make investment recommendations in the portal.</p>
    </>
  );
}
