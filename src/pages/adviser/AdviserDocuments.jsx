import { useState } from 'react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Section from '../../components/common/Section.jsx';
import { QueryState } from '../../components/common/States.jsx';
import DocumentList from '../../components/documents/DocumentList.jsx';
import { useCurrentAdviser } from '../../hooks/useCurrentUser.js';
import { useServiceQuery } from '../../hooks/useServiceQuery.js';
import { useLookups } from '../../hooks/useLookups.js';
import { listDocuments } from '../../services/documentService.js';

const FILTERS = [
  { key: 'attention', label: 'Needs attention', statuses: ['missing', 'expired', 'expiring_soon', 'under_review'] },
  { key: 'all', label: 'All documents', statuses: null },
];

export default function AdviserDocuments() {
  const adviser = useCurrentAdviser();
  const adviserId = adviser.data?.id;
  const docs = useServiceQuery(() => (adviserId ? listDocuments({ adviserId }) : []), [adviserId]);
  const { clientName } = useLookups();
  const [filter, setFilter] = useState(FILTERS[0]);

  return (
    <>
      <PageHeader title="Documents" description="Missing, expiring and under-review documents across your clients." />
      <div className="mb-5 flex gap-2">
        {FILTERS.map((f) => (
          <button key={f.key} type="button" onClick={() => setFilter(f)} aria-pressed={filter.key === f.key} className={`rounded border px-3 py-1.5 text-[14px] font-semibold ${filter.key === f.key ? 'border-brand-red bg-brand-red text-white' : 'border-brand-border hover:border-brand-black'}`}>
            {f.label}
          </button>
        ))}
      </div>
      <QueryState query={docs} loadingLabel="Loading documents">
        {(list) => {
          const shown = filter.statuses ? list.filter((d) => filter.statuses.includes(d.status)) : list;
          return (
            <Section title={filter.label} count={shown.length}>
              <DocumentList documents={shown} clientName={clientName} />
            </Section>
          );
        }}
      </QueryState>
    </>
  );
}
