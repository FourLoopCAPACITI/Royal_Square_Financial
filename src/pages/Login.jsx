import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import Logo from '../components/common/Logo.jsx';
import Button from '../components/common/Button.jsx';
import { useSession } from '../context/SessionContext.jsx';
import { homeFor } from '../components/layout/ProtectedRoute.jsx';
import { IS_SUPABASE_CONFIGURED } from '../config/env.js';

export default function Login() {
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
      setError(err.message || 'Sign-in failed. Check your email and password.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-light-grey px-4">
      <div className="w-full max-w-sm rounded-md border border-brand-border bg-white p-7">
        <Logo className="mx-auto mb-7 max-w-[160px]" />
        <h1 className="mb-1 text-2xl font-normal">Sign in</h1>
        {!IS_SUPABASE_CONFIGURED ? (
          <p className="text-[14px] text-brand-grey">
            Supabase isn't configured yet, so sign-in is off. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local, or use demo mode.
          </p>
        ) : (
          <form onSubmit={onSubmit} className="mt-5 space-y-4">
            <div>
              <label htmlFor="email" className="field-label">Email</label>
              <input id="email" type="email" className="field" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
            </div>
            <div>
              <label htmlFor="password" className="field-label">Password</label>
              <input id="password" type="password" className="field" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
            </div>
            {error && <p className="text-[14px] text-brand-red" role="alert">{error}</p>}
            <Button type="submit" className="w-full" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</Button>
          </form>
        )}
        <p className="mt-6 text-center text-[14px]">
          Need an account?{' '}
          <Link to="/signup" className="font-semibold text-brand-red hover:underline">Create one</Link>
        </p>
        {demoModeEnabled && (
          <p className="mt-3 text-center text-[14px]">
            <Link to="/" className="font-semibold text-brand-red hover:underline">Use demo mode instead</Link>
          </p>
        )}
      </div>
    </div>
  );
}
