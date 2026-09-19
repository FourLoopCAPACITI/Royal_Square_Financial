import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle({ children }) {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = (value) => {
      document.documentElement.classList.toggle('dark', value);
      setDark(value);
    };
    const followSystem = () => {
      let saved;
      try { saved = localStorage.getItem('rsf-theme'); } catch { /* Use system preference. */ }
      apply(saved === 'dark' || (saved !== 'light' && media.matches));
    };
    const syncStorage = (event) => {
      if (event.key === 'rsf-theme' || event.key === null) followSystem();
    };
    media.addEventListener('change', followSystem);
    window.addEventListener('storage', syncStorage);
    return () => {
      media.removeEventListener('change', followSystem);
      window.removeEventListener('storage', syncStorage);
    };
  }, []);

  const toggle = () => {
    const next = !dark;
    document.documentElement.classList.toggle('dark', next);
    setDark(next);
    try { localStorage.setItem('rsf-theme', next ? 'dark' : 'light'); } catch { /* Still works for this session. */ }
  };
  const label = `Switch to ${dark ? 'light' : 'dark'} mode`;
  const Icon = dark ? Sun : Moon;

  return (
    <div className="sticky top-0 z-50 flex h-14 items-center justify-end gap-2 border-b border-brand-border bg-surface px-3 sm:gap-3 sm:px-6">
      {children}
      <button type="button" onClick={toggle} aria-label={label} title={label}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-brand-border text-brand-black transition-colors hover:bg-brand-light-grey">
        <Icon size={21} aria-hidden="true" />
      </button>
    </div>
  );
}
