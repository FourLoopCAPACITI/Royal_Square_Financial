import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import Logo from '../components/common/Logo.jsx';
import Button from '../components/common/Button.jsx';
import { useSession } from '../context/SessionContext.jsx';
import { homeFor } from '../components/layout/ProtectedRoute.jsx';
import { IS_SUPABASE_CONFIGURED } from '../config/env.js';

export default function Signup() {
  const { signUp, isAuthenticated, role } = useSession();
  const [firstName, setFirstName] = useState('');
  const [surname, setSurname] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);

  if (isAuthenticated && role) return <Navigate to={homeFor(role)} replace />;

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!acceptedTerms) {
      setError('Please accept the terms and conditions to continue.');
      return;
    }

    setBusy(true);

    try {
      await signUp(email, password);
      setSuccess('Your account has been created. Check your email to confirm sign-up before signing in.');
      setFirstName('');
      setSurname('');
      setCustomerId('');
      setPhoneNumber('');
      setEmail('');
      setPassword('');
      setAcceptedTerms(false);
    } catch (err) {
      setError(err.message || 'Sign-up failed. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-light-grey px-4">
      <div className="w-full max-w-sm rounded-md border border-brand-border bg-white p-7">
        <Logo className="mx-auto mb-7 max-w-[160px]" />
        <h1 className="mb-1 text-2xl font-normal">Sign up</h1>

        {!IS_SUPABASE_CONFIGURED ? (
          <p className="text-[14px] text-brand-grey">
            Supabase isn't configured yet, so sign-up is disabled. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local.
          </p>
        ) : (
          <form onSubmit={onSubmit} className="mt-5 space-y-4">
            <div>
              <label htmlFor="signup-first-name" className="field-label">First name</label>
              <input
                id="signup-first-name"
                type="text"
                className="field"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                autoComplete="given-name"
              />
            </div>
            <div>
              <label htmlFor="signup-surname" className="field-label">Surname</label>
              <input
                id="signup-surname"
                type="text"
                className="field"
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
                required
                autoComplete="family-name"
              />
            </div>
            <div>
              <label htmlFor="signup-customer-id" className="field-label">Customer ID</label>
              <input
                id="signup-customer-id"
                type="text"
                className="field"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="signup-phone" className="field-label">Phone number</label>
              <input
                id="signup-phone"
                type="tel"
                className="field"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
                autoComplete="tel"
              />
            </div>
            <div>
              <label htmlFor="signup-email" className="field-label">Email</label>
              <input
                id="signup-email"
                type="email"
                className="field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label htmlFor="signup-password" className="field-label">Password</label>
              <input
                id="signup-password"
                type="password"
                className="field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                minLength={6}
              />
            </div>

            <label className="flex items-start gap-3 text-[14px] text-brand-grey">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-brand-border text-brand-red focus:ring-brand-red"
              />
              <span>
                I have read and agree to the{' '}
                <Link to="/terms-and-conditions" className="font-semibold text-brand-red underline underline-offset-2 hover:text-brand-red-dark">
                  terms and conditions
                </Link>
              </span>
            </label>

            {error && <p className="text-[14px] text-brand-red" role="alert">{error}</p>}
            {success && <p className="text-[14px] text-brand-black" role="status">{success}</p>}

            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? 'Creating account…' : 'Sign up'}
            </Button>
          </form>
        )}

        <p className="mt-6 text-center text-[14px]">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-brand-red hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
