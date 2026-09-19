import { Link } from 'react-router-dom';
import { TriangleAlert } from 'lucide-react';

/** The prominent entry point to Accident Assist. */
export default function AccidentButton({ className = '' }) {
  return (
    <Link
      to="/accident-assist"
      className={`inline-flex items-center justify-center gap-2.5 rounded bg-brand-red px-5 py-3.5 text-[17px] font-semibold text-white hover:bg-brand-red-dark ${className}`}
    >
      <TriangleAlert size={20} aria-hidden="true" />
      I've been in an accident
    </Link>
  );
}
