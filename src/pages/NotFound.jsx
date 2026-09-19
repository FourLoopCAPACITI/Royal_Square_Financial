import { Link } from 'react-router-dom';
import Logo from '../components/common/Logo.jsx';
import { useI18n } from '../i18n/I18nContext.jsx';

export default function NotFound() {
  const { t } = useI18n();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <Logo className="max-w-[140px]" />
      <h1 className="text-2xl font-normal">{t('notFound.title')}</h1>
      <p className="text-brand-grey">{t('notFound.hint')}</p>
      <Link to="/" className="font-semibold text-brand-red hover:underline">{t('notFound.home')}</Link>
    </div>
  );
}
