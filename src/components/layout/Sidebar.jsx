import { NavLink } from 'react-router-dom';
import Logo from '../common/Logo.jsx';
import { useI18n } from '../../i18n/I18nContext.jsx';

export default function Sidebar({ items, footer }) {
  const { t } = useI18n();
  return (
    <aside className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-[248px] shrink-0 flex-col border-r border-brand-border bg-surface lg:flex">
      <div className="px-6 pb-6 pt-7">
        <Logo className="rounded-xl" />
      </div>
      <nav aria-label={t('nav.main')} className="flex-1 overflow-y-auto px-3">
        <ul className="space-y-0.5">
          {items.map(({ to, labelKey, icon: Icon, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  `relative flex items-center gap-3 rounded px-3 py-2.5 text-[15px] transition-colors ${
                    isActive
                      ? 'bg-brand-red-tint font-semibold text-brand-red before:absolute before:inset-y-1.5 before:left-0 before:w-[3px] before:rounded-full before:bg-action'
                      : 'text-text-secondary hover:bg-brand-light-grey'
                  }`
                }
              >
                <Icon size={18} aria-hidden="true" />
                {t(labelKey)}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      {footer && <div className="border-t border-brand-border px-6 py-4">{footer}</div>}
    </aside>
  );
}
