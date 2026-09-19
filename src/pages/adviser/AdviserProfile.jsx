import PageHeader from '../../components/common/PageHeader.jsx';
import Section from '../../components/common/Section.jsx';
import { QueryState } from '../../components/common/States.jsx';
import { useCurrentAdviser } from '../../hooks/useCurrentUser.js';
import { useServiceQuery } from '../../hooks/useServiceQuery.js';
import { listClients } from '../../services/clientService.js';

export default function AdviserProfile() {
  const adviser = useCurrentAdviser();
  const adviserId = adviser.data?.id;
  const clients = useServiceQuery(() => (adviserId ? listClients({ adviserId }) : []), [adviserId], { dependsOn: adviser });
  return (
    <>
      <PageHeader title="Profile" description="Your adviser details." />
      <QueryState query={adviser}>
        {(a) =>
          a && (
            <Section title="Details">
              <dl className="divide-y divide-brand-border">
                {[
                  ['Name', a.name],
                  ['Email', a.email],
                  ['Phone', a.phone],
                  ['Region', a.region],
                  ['FSP representative no.', a.fspRepNumber],
                  ['Assigned clients', clients.data?.length ?? '…'],
                ].map(([label, value]) => (
                  <div key={label} className="grid gap-1 py-3 sm:grid-cols-[220px_1fr]">
                    <dt className="text-brand-grey">{label}</dt>
                    <dd className="font-medium">{value || '—'}</dd>
                  </div>
                ))}
              </dl>
            </Section>
          )
        }
      </QueryState>
    </>
  );
}
