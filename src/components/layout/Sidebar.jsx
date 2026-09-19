import { NavLink } from 'react-router-dom';
import Logo from '../common/Logo.jsx';

export default function Sidebar({ items, footer }) {
  return (
    <aside className="sticky top-0 hidden h-screen w-[248px] shrink-0 flex-col border-r border-brand-border bg-white lg:flex">
      <div className="px-6 pb-6 pt-7">
        <Logo />
      </div>
      <nav aria-label="Main" className="flex-1 overflow-y-auto px-3">
        <ul className="space-y-0.5">
          {items.map(({ to, label, icon: Icon, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  `relative flex items-center gap-3 rounded px-3 py-2.5 text-[15px] transition-colors ${
                    isActive
                      ? 'bg-brand-red-tint font-semibold text-brand-red before:absolute before:inset-y-1.5 before:left-0 before:w-[3px] before:rounded-full before:bg-brand-red'
                      : 'text-[#3A3A3A] hover:bg-brand-light-grey'
                  }`
                }
              >
                <Icon size={18} aria-hidden="true" />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      {footer && <div className="border-t border-brand-border px-6 py-4">{footer}</div>}
    </aside>
  );
}
