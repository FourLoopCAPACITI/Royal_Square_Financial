import { useI18n } from '../../i18n/I18nContext.jsx';

/** The one language dropdown (English, Afrikaans, isiZulu). Used on profiles, sign-in and the start page. */
export default function LanguageSelect({ id = 'language', className = '', showHelp = false }) {
  const { lang, setLanguage, languages, t } = useI18n();
  return (
    <div className={className}>
      <label htmlFor={id} className="field-label">{t('language.label')}</label>
      <select id={id} className="field" value={lang} onChange={(e) => setLanguage(e.target.value)} lang={lang}>
        {languages.map((l) => (
          <option key={l.code} value={l.code}>{l.label}</option>
        ))}
      </select>
      {showHelp && <p className="mt-1.5 text-sm text-text-secondary">{t('language.help')}</p>}
    </div>
  );
}
