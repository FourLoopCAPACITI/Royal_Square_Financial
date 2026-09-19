import { Link } from 'react-router-dom';
import { TriangleAlert } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext.jsx';

/** The prominent entry point to Accident Assist. */
export default function AccidentButton({ className = '', compact = false }) {
  const { t } = useI18n();
  return (
    <Link
      to="/accident-assist"
      className={`inline-flex items-center justify-center rounded bg-action font-semibold text-white hover:bg-brand-red-dark ${compact ? 'h-11 min-w-0 gap-2 px-3 text-[13px] leading-tight sm:text-sm' : 'gap-2.5 px-5 py-3.5 text-[16px]'} ${className}`}
    >
      <TriangleAlert size={compact ? 18 : 20} className="shrink-0" aria-hidden="true" />
      <span>{t('accidentButton')}</span>
    </Link>
  );
}
