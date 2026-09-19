import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Logo from '../common/Logo.jsx';
import { useI18n } from '../../i18n/I18nContext.jsx';

/** Top bar + bottom tab bar + "More" sheet for small screens. */
export default function MobileNav({ items, footer }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  useEffect(() => setOpen(false), [location.pathname]);

  const primary = items.filter((i) => i.mobile);

  return (
    <>
      <div className="sticky top-14 z-30 flex items-center justify-between border-b border-brand-border bg-surface px-4 py-2.5 lg:hidden">
        <div className="flex items-center gap-2.5">
          <Logo variant="mark" />
          <span className="font-display text-[14.5px] uppercase tracking-[0.28em]">
            Royal<span className="text-brand-grey">Square</span>
          </span>
        </div>
      </div>

      <nav aria-label={t('nav.main')} className="fixed inset-x-0 bottom-0 z-30 border-t border-brand-border bg-surface pb-[env(safe-area-inset-bottom)] lg:hidden">
        <ul className="grid grid-cols-5">
          {primary.map(({ to, labelKey, shortKey, icon: Icon, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-0.5 px-1 py-2 text-[12.5px] ${isActive ? 'font-semibold text-brand-red' : 'text-text-secondary'}`
                }
              >
                <Icon size={20} aria-hidden="true" />
                <span className="truncate">{t(shortKey || labelKey)}</span>
              </NavLink>
            </li>
          ))}
          <li>
            <button type="button" onClick={() => setOpen(true)} className="flex w-full flex-col items-center gap-0.5 px-1 py-2 text-[12.5px] text-text-secondary" aria-expanded={open}>
              <Menu size={20} aria-hidden="true" />
              {t('nav.more')}
            </button>
          </li>
        </ul>
      </nav>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label={t('nav.allPages')}>
          <button type="button" className="absolute inset-0 bg-black/30" aria-label={t('nav.closeMenu')} onClick={() => setOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[80vh] overflow-y-auto rounded-t-lg bg-surface p-4 pb-8">
            <div className="mb-2 flex items-center justify-between">
              <p className="font-display text-lg">{t('nav.allPages')}</p>
              <button type="button" onClick={() => setOpen(false)} className="rounded p-2 hover:bg-brand-light-grey" aria-label={t('nav.closeMenu')}>
                <X size={20} />
              </button>
            </div>
            <ul className="grid grid-cols-2 gap-1">
              {items.map(({ to, labelKey, icon: Icon, end }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={end}
                    className={({ isActive }) => `flex items-center gap-2.5 rounded px-3 py-3 ${isActive ? 'bg-brand-red-tint font-semibold text-brand-red' : 'hover:bg-brand-light-grey'}`}
                  >
                    <Icon size={18} aria-hidden="true" />
                    {t(labelKey)}
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
