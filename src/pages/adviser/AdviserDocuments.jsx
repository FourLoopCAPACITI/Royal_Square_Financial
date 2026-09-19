import { useSearchParams } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader.jsx';
import Section from '../../components/common/Section.jsx';
import { QueryState } from '../../components/common/States.jsx';
import DocumentList from '../../components/documents/DocumentList.jsx';
import { useCurrentAdviser } from '../../hooks/useCurrentUser.js';
import { useServiceQuery } from '../../hooks/useServiceQuery.js';
import { useLookups } from '../../hooks/useLookups.js';
import { listDocuments } from '../../services/documentService.js';
import { useI18n } from '../../i18n/I18nContext.jsx';

// Labels are i18n keys: documents.filter.<key>.
const FILTERS = [
  { key: 'attention', statuses: ['missing', 'expired', 'expiring_soon', 'under_review'] },
  { key: 'all', statuses: null },
];

export default function AdviserDocuments() {
  const { t } = useI18n();
  const adviser = useCurrentAdviser();
  const adviserId = adviser.data?.id;
  const docs = useServiceQuery(() => (adviserId ? listDocuments({ adviserId }) : []), [adviserId], { dependsOn: adviser });
  const { clientName } = useLookups();
  const [params, setParams] = useSearchParams();
  const filter = FILTERS.find((item) => item.key === params.get('filter')) || FILTERS[0];

  return (
    <>
      <PageHeader title={t('documents.title')} description={t('documents.adviserDescription')} />
      <div className="mb-5 flex gap-2">
        {FILTERS.map((f) => (
          <button key={f.key} type="button" onClick={() => setParams({ filter: f.key })} aria-pressed={filter.key === f.key} className={`rounded border px-3 py-1.5 text-[15.5px] font-semibold ${filter.key === f.key ? 'border-brand-red bg-action text-white' : 'border-brand-border hover:border-brand-black'}`}>
            {t(`documents.filter.${f.key}`)}
          </button>
        ))}
      </div>
      <QueryState query={docs} loadingLabel={t('documents.loading')}>
        {(list) => {
          const shown = filter.statuses ? list.filter((d) => filter.statuses.includes(d.status)) : list;
          return (
            <Section title={t(`documents.filter.${filter.key}`)} count={shown.length}>
              <DocumentList documents={shown} clientName={clientName} />
            </Section>
          );
        }}
      </QueryState>
    </>
  );
}
