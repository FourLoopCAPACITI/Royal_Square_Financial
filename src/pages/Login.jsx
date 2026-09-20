import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import Logo from '../components/common/Logo.jsx';
import Button from '../components/common/Button.jsx';
import { useSession } from '../context/SessionContext.jsx';
import { homeFor } from '../components/layout/ProtectedRoute.jsx';
import { IS_SUPABASE_CONFIGURED } from '../config/env.js';
import LanguageSelect from '../components/common/LanguageSelect.jsx';
import { useI18n, validationProps } from '../i18n/I18nContext.jsx';

export default function Login() {
  const { t, tx } = useI18n();
  const { signIn, isAuthenticated, role, demoModeEnabled } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (isAuthenticated && role) return <Navigate to={homeFor(role)} replace />;

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await signIn(email, password);
    } catch (err) {
      setError(tx(err.message) === err.message ? t('login.failed') : tx(err.message));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-light-grey px-4">
      <div className="w-full max-w-sm rounded-lg border border-brand-border border-t-4 border-t-gold bg-surface p-8 shadow-card">
        <Logo className="mx-auto mb-8 max-w-[230px]" />
        <h1 className="mb-1 text-3xl font-semibold">{t('login.title')}</h1>
        {!IS_SUPABASE_CONFIGURED ? (
          <p className="text-[15.5px] text-brand-grey">
            {t('login.notConfigured')}
          </p>
        ) : (
          <form onSubmit={onSubmit} className="mt-5 space-y-4">
            <div>
              <label htmlFor="email" className="field-label">{t('login.email')}</label>
              <input id="email" type="email" className="field" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" {...validationProps()} />
            </div>
            <div>
              <label htmlFor="password" className="field-label">{t('login.password')}</label>
              <input id="password" type="password" className="field" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" {...validationProps()} />
            </div>
            {error && <p className="text-[15.5px] text-danger" role="alert">{error}</p>}
            <Button type="submit" className="w-full" disabled={busy}>{busy ? t('login.submitting') : t('login.submit')}</Button>
          </form>
        )}
        <p className="mt-6 text-center text-[15.5px]">
          Need an account?{' '}
          <Link to="/signup" className="font-semibold text-brand-red hover:underline">Create one</Link>
        </p>
        {demoModeEnabled && (
          <p className="mt-6 text-center text-[15.5px]">
            <Link to="/" className="font-semibold text-brand-red hover:underline">{t('login.useDemo')}</Link>
          </p>
        )}
        <LanguageSelect id="login-language" className="mt-6" />
      </div>
    </div>
  );
}
