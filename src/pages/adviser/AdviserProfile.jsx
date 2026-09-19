import PageHeader from '../../components/common/PageHeader.jsx';
import Section from '../../components/common/Section.jsx';
import { QueryState } from '../../components/common/States.jsx';
import { useCurrentAdviser } from '../../hooks/useCurrentUser.js';
import { useServiceQuery } from '../../hooks/useServiceQuery.js';
import { listClients } from '../../services/clientService.js';
import LanguageSelect from '../../components/common/LanguageSelect.jsx';
import { useI18n } from '../../i18n/I18nContext.jsx';

export default function AdviserProfile() {
  const { t } = useI18n();
  const adviser = useCurrentAdviser();
  const adviserId = adviser.data?.id;
  const clients = useServiceQuery(() => (adviserId ? listClients({ adviserId }) : []), [adviserId], { dependsOn: adviser });
  return (
    <>
      <PageHeader title={t('profile.title')} description={t('profile.adviserDescription')} />
      <QueryState query={adviser}>
        {(a) =>
          a && (
            <Section title={t('profile.details')}>
              <dl className="divide-y divide-brand-border">
                {[
                  [t('profile.name'), a.name],
                  [t('profile.email'), a.email],
                  [t('profile.phone'), a.phone],
                  [t('profile.region'), a.region],
                  [t('profile.fspRep'), a.fspRepNumber],
                  [t('profile.assignedClients'), clients.data?.length ?? '…'],
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
      {/* Outside QueryState so the language can always be changed, even if the adviser record fails to load. */}
      <Section title={t('profile.settings')}>
        <LanguageSelect id="profile-language" className="max-w-xs" showHelp />
      </Section>
    </>
  );
}
