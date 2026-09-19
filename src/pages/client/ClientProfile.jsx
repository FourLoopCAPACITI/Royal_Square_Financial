import PageHeader from '../../components/common/PageHeader.jsx';
import Section from '../../components/common/Section.jsx';
import { QueryState } from '../../components/common/States.jsx';
import { useCurrentClient } from '../../hooks/useCurrentUser.js';
import { useServiceQuery } from '../../hooks/useServiceQuery.js';
import { useLookups } from '../../hooks/useLookups.js';
import { listAdvisers, listClientProducts } from '../../services/clientService.js';
import { formatDate } from '../../utils/format.js';

function Row({ label, value }) {
  return (
    <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-[200px_1fr]">
      <dt className="text-brand-grey">{label}</dt>
      <dd className="font-medium">{value || '—'}</dd>
    </div>
  );
}

export default function ClientProfile() {
  const client = useCurrentClient();
  const clientId = client.data?.id;
  const products = useServiceQuery(() => (clientId ? listClientProducts(clientId) : []), [clientId], { dependsOn: client });
  const advisers = useServiceQuery(() => listAdvisers(), []);
  const { providerName } = useLookups();

  return (
    <>
      <PageHeader title="Profile" description="Your details and the products Royal Square looks after for you." />
      <QueryState query={client}>
        {(c) =>
          c && (
            <>
              <Section title="Personal details">
                <dl className="divide-y divide-brand-border">
                  <Row label="Name" value={c.name} />
                  <Row label="ID number" value={c.idNumberMasked} />
                  <Row label="Date of birth" value={formatDate(c.dateOfBirth)} />
                  <Row label="Email" value={c.email} />
                  <Row label="Mobile" value={c.phone} />
                  <Row label="Address" value={[c.address, c.city, c.postalCode].filter(Boolean).join(', ')} />
                  <Row label="Occupation" value={c.occupation} />
                  <Row label="Your adviser" value={advisers.data?.filter((a) => c.adviserIds.includes(a.id)).map((a) => a.name).join(', ')} />
                </dl>
                <p className="mt-2 text-[13px] text-brand-grey">To change your address or bank details, use Life Events or Requests so every provider is updated.</p>
              </Section>
              <Section title="Your products" count={products.data?.length}>
                <QueryState query={products}>
                  {(list) => (
                    <ul className="divide-y divide-brand-border rounded-md border border-brand-border">
                      {list.map((p) => (
                        <li key={p.id} className="flex flex-wrap justify-between gap-2 p-4">
                          <span>
                            <span className="block font-semibold">{p.type}</span>
                            <span className="text-[14px] text-brand-grey">{providerName(p.providerId)}. {p.description}</span>
                          </span>
                          <span className="text-[14px] tabular-nums text-brand-grey">{p.policyNumber}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </QueryState>
              </Section>
            </>
          )
        }
      </QueryState>
    </>
  );
}
