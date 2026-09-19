import PageHeader from '../../components/common/PageHeader.jsx';
import Section from '../../components/common/Section.jsx';
import { QueryState } from '../../components/common/States.jsx';
import { useCurrentClient } from '../../hooks/useCurrentUser.js';
import { useServiceQuery } from '../../hooks/useServiceQuery.js';
import { useLookups } from '../../hooks/useLookups.js';
import { listAdvisers, listClientProducts } from '../../services/clientService.js';
import { formatDate } from '../../utils/format.js';
import LanguageSelect from '../../components/common/LanguageSelect.jsx';
import { useI18n } from '../../i18n/I18nContext.jsx';

function Row({ label, value }) {
  return (
    <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-[200px_1fr]">
      <dt className="text-brand-grey">{label}</dt>
      <dd className="font-medium">{value || '—'}</dd>
    </div>
  );
}

export default function ClientProfile() {
  const { t, tx } = useI18n();
  const client = useCurrentClient();
  const clientId = client.data?.id;
  const products = useServiceQuery(() => (clientId ? listClientProducts(clientId) : []), [clientId], { dependsOn: client });
  const advisers = useServiceQuery(() => listAdvisers(), []);
  const { providerName } = useLookups();

  return (
    <>
      <PageHeader title={t('profile.title')} description={t('profile.clientDescription')} />
      <QueryState query={client}>
        {(c) =>
          c && (
            <>
              <Section title={t('profile.personal')}>
                <dl className="divide-y divide-brand-border">
                  <Row label={t('profile.name')} value={c.name} />
                  <Row label={t('profile.idNumber')} value={c.idNumberMasked} />
                  <Row label={t('profile.dob')} value={formatDate(c.dateOfBirth)} />
                  <Row label={t('profile.email')} value={c.email} />
                  <Row label={t('profile.mobile')} value={c.phone} />
                  <Row label={t('profile.address')} value={[c.address, c.city, c.postalCode].filter(Boolean).join(', ')} />
                  <Row label={t('profile.occupation')} value={tx(c.occupation)} />
                  <Row label={t('profile.yourAdviser')} value={advisers.data?.filter((a) => c.adviserIds.includes(a.id)).map((a) => a.name).join(', ')} />
                </dl>
                <p className="mt-2 text-[13px] text-brand-grey">{t('profile.changeHint')}</p>
              </Section>
              <Section title={t('profile.products')} count={products.data?.length}>
                <QueryState query={products}>
                  {(list) => (
                    <ul className="divide-y divide-brand-border rounded-md border border-brand-border">
                      {list.map((p) => (
                        <li key={p.id} className="flex flex-wrap justify-between gap-2 p-4">
                          <span>
                            <span className="block font-semibold">{tx(p.type)}</span>
                            <span className="text-[14px] text-brand-grey">{providerName(p.providerId)}. {tx(p.description)}</span>
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
      {/* Outside QueryState so the language can always be changed, even if the client record fails to load. */}
      <Section title={t('profile.settings')}>
        <LanguageSelect id="profile-language" className="max-w-xs" showHelp />
      </Section>
    </>
  );
}
