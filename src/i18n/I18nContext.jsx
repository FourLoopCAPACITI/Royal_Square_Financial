/**
 * Language state for the whole app.
 *
 * Source of truth:
 *  - signed in  → profiles.language (same for clients and advisers), so it survives logout/login and other devices.
 *  - signed out / demo → this device's localStorage.
 * The device copy is always kept in step, so the login page opens in the language you last used.
 *
 * <LanguageKey> remounts the routed tree when the language changes so everything, including plain helper
 * functions such as describeDue(), re-renders in the new language without each component subscribing.
 */
import { Fragment, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useSession } from '../context/SessionContext.jsx';
import { DEFAULT_LANGUAGE, LANGUAGES, isSupportedLanguage, setActiveLanguage, t, tx } from './index.js';

const DEVICE_KEY = 'rsf-language';
const I18nContext = createContext(null);

function readDevice() {
  try {
    const stored = window.localStorage.getItem(DEVICE_KEY);
    return isSupportedLanguage(stored) ? stored : DEFAULT_LANGUAGE;
  } catch {
    return DEFAULT_LANGUAGE;
  }
}

function writeDevice(code) {
  try {
    window.localStorage.setItem(DEVICE_KEY, code);
  } catch {
    /* private mode etc. — the profile still holds it */
  }
}

export function LanguageProvider({ children }) {
  const { isAuthenticated, profile, updateProfile } = useSession();
  const [deviceLang, setDeviceLang] = useState(readDevice);

  const profileLang = isAuthenticated && isSupportedLanguage(profile?.language) ? profile.language : null;
  const lang = profileLang || deviceLang;
  setActiveLanguage(lang); // idempotent; must be set before children render

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  // After sign-in, adopt the profile's language and remember it on this device.
  useEffect(() => {
    if (profileLang) {
      writeDevice(profileLang);
      setDeviceLang(profileLang);
    }
  }, [profileLang]);

  const setLanguage = useCallback(
    (code) => {
      if (!isSupportedLanguage(code)) return;
      writeDevice(code);
      setDeviceLang(code);
      if (isAuthenticated) updateProfile({ language: code });
    },
    [isAuthenticated, updateProfile],
  );

  const value = useMemo(() => ({ lang, setLanguage, languages: LANGUAGES, t, tx }), [lang, setLanguage]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

/** const { t, tx, lang, setLanguage } = useI18n(); */
export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside <LanguageProvider>');
  return ctx;
}

export function LanguageKey({ children }) {
  const { lang } = useI18n();
  return <Fragment key={lang}>{children}</Fragment>;
}

/** Translated native-form validation: spread onto <input required>. */
export function validationProps() {
  return {
    onInvalid: (e) => {
      const { validity } = e.target;
      e.target.setCustomValidity(validity.valueMissing ? t('validation.required') : validity.typeMismatch ? t('validation.email') : '');
    },
    onInput: (e) => e.target.setCustomValidity(''),
  };
}
