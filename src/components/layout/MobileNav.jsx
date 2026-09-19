import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Logo from '../common/Logo.jsx';

/** Top bar + bottom tab bar + "More" sheet for small screens. */
export default function MobileNav({ items, footer }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  useEffect(() => setOpen(false), [location.pathname]);

  const primary = items.filter((i) => i.mobile);

  return (
    <>
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-brand-border bg-white px-4 py-2.5 lg:hidden">
        <div className="flex items-center gap-2.5">
          <Logo variant="mark" />
          <span className="font-display text-[13px] uppercase tracking-[0.28em]">
            Royal<span className="text-brand-grey">Square</span>
          </span>
        </div>
      </div>

      <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-30 border-t border-brand-border bg-white pb-[env(safe-area-inset-bottom)] lg:hidden">
        <ul className="grid grid-cols-5">
          {primary.map(({ to, label, icon: Icon, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-0.5 px-1 py-2 text-[11px] ${isActive ? 'font-semibold text-brand-red' : 'text-[#4A4A4A]'}`
                }
              >
                <Icon size={20} aria-hidden="true" />
                <span className="truncate">{label.replace('Action Inbox', 'Inbox').replace('My Actions', 'Actions')}</span>
              </NavLink>
            </li>
          ))}
          <li>
            <button type="button" onClick={() => setOpen(true)} className="flex w-full flex-col items-center gap-0.5 px-1 py-2 text-[11px] text-[#4A4A4A]" aria-expanded={open}>
              <Menu size={20} aria-hidden="true" />
              More
            </button>
          </li>
        </ul>
      </nav>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="All pages">
          <button type="button" className="absolute inset-0 bg-black/30" aria-label="Close menu" onClick={() => setOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[80vh] overflow-y-auto rounded-t-lg bg-white p-4 pb-8">
            <div className="mb-2 flex items-center justify-between">
              <p className="font-display text-lg">All pages</p>
              <button type="button" onClick={() => setOpen(false)} className="rounded p-2 hover:bg-brand-light-grey" aria-label="Close menu">
                <X size={20} />
              </button>
            </div>
            <ul className="grid grid-cols-2 gap-1">
              {items.map(({ to, label, icon: Icon, end }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={end}
                    className={({ isActive }) => `flex items-center gap-2.5 rounded px-3 py-3 ${isActive ? 'bg-brand-red-tint font-semibold text-brand-red' : 'hover:bg-brand-light-grey'}`}
                  >
                    <Icon size={18} aria-hidden="true" />
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
            {footer && <div className="mt-4 border-t border-brand-border pt-4">{footer}</div>}
          </div>
        </div>
      )}
    </>
  );
}
