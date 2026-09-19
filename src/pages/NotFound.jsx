import { Link } from 'react-router-dom';
import Logo from '../components/common/Logo.jsx';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <Logo className="max-w-[140px]" />
      <h1 className="text-2xl font-normal">This page doesn't exist</h1>
      <p className="text-brand-grey">Check the address, or go back to your dashboard.</p>
      <Link to="/" className="font-semibold text-brand-red hover:underline">Go to the start page</Link>
    </div>
  );
}
