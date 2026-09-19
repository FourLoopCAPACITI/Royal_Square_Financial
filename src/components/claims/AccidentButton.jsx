import { Link } from 'react-router-dom';
import { TriangleAlert } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext.jsx';

/** The prominent entry point to Accident Assist. */
export default function AccidentButton({ className = '' }) {
  const { t } = useI18n();
  return (
    <Link
      to="/accident-assist"
      className={`inline-flex items-center justify-center gap-2.5 rounded bg-brand-red px-5 py-3.5 text-[16px] font-semibold text-white hover:bg-brand-red-dark ${className}`}
    >
      <TriangleAlert size={20} aria-hidden="true" />
      {t('accidentButton')}
    </Link>
  );
}
