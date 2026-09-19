/**
 * Localisation core — no React, so utils and services can translate too.
 *
 * Two kinds of text, two functions:
 *  - t('nav.dashboard', { count })  UI copy, looked up by a semantic key in locales/<lang>.js → ui.
 *  - tx('Motor claim')              stored / template / mock content that already arrives as English.
 *                                   Looked up by its English text in locales/<lang>.js → data. Entries containing
 *                                   {0}, {1}… match dynamic sentences ("{0} started"); the parts are translated too.
 * English is the default and the fallback for anything missing.
 *
 * Add a language: create locales/xx.js, register it in RESOURCES + LANGUAGES. Add copy: add the key to en.js
 * (and af.js / zu.js; a missing translation falls back to English).
 */
import en from './locales/en.js';
import af from './locales/af.js';
import zu from './locales/zu.js';

export const DEFAULT_LANGUAGE = 'en';

/** Exactly the options shown in the language dropdown. `label` is each language's own name. */
export const LANGUAGES = [
  { code: 'en', label: 'English', locale: 'en-ZA' },
  { code: 'af', label: 'Afrikaans', locale: 'af-ZA' },
  { code: 'zu', label: 'isiZulu', locale: 'zu-ZA' },
];

const RESOURCES = { en, af, zu };
let current = DEFAULT_LANGUAGE;

export const isSupportedLanguage = (code) => LANGUAGES.some((l) => l.code === code);
export const getLanguage = () => current;
export const setActiveLanguage = (code) => {
  current = isSupportedLanguage(code) ? code : DEFAULT_LANGUAGE;
};
/** BCP-47 tag for Intl / toLocale*String. */
export const getLocale = () => LANGUAGES.find((l) => l.code === current).locale;

function interpolate(text, params) {
  return params ? text.replace(/\{(\w+)\}/g, (m, k) => (params[k] ?? m)) : text;
}

/** UI copy. `count` picks key_one / key_other when those variants exist. */
export function t(key, params) {
  const ui = RESOURCES[current].ui;
  let text;
  if (params && typeof params.count === 'number') {
    const variant = `${key}_${params.count === 1 ? 'one' : 'other'}`;
    text = ui[variant] ?? en.ui[variant];
  }
  text ??= ui[key] ?? en.ui[key] ?? key;
  return interpolate(text, params);
}

// ── tx(): translate English source text ───────────────────────────────
const compiled = {};
function compile(lang) {
  const data = RESOURCES[lang].data;
  const lower = {};
  const patterns = [];
  Object.entries(data).forEach(([source, target]) => {
    if (/\{\d\}/.test(source)) {
      const escaped = source.replace(/[.*+?^$()|[\]\\]/g, '\\$&');
      const re = new RegExp(`^${escaped.replace(/\{\d\}/g, '(.+?)')}$`);
      patterns.push([re, target]);
    } else {
      lower[source.toLowerCase()] = target;
    }
  });
  return (compiled[lang] = { data, lower, patterns });
}

export function tx(text) {
  if (typeof text !== 'string' || !text || current === DEFAULT_LANGUAGE) return text;
  const { data, lower, patterns } = compiled[current] || compile(current);
  if (data[text]) return data[text];
  if (text.includes(' · ')) return text.split(' · ').map(tx).join(' · ');
  for (const [re, target] of patterns) {
    const m = text.match(re);
    if (m) return target.replace(/\{(\d)\}/g, (_, i) => tx(m[Number(i) + 1]));
  }
  // Sentence-cased or lower-cased variants of a known phrase ("…: claim number received confirmed").
  const hit = lower[text.toLowerCase()];
  if (hit) return text[0] === text[0].toLowerCase() ? hit[0].toLowerCase() + hit.slice(1) : hit;
  return text;
}

/** Month names for languages whose browser Intl data is incomplete (isiZulu formats as English in Chrome). */
export const getMonthNames = () => RESOURCES[current].months ?? null;

/** Chatbot fallback guide for the active language (see locales → chat.fallback). */
export function getFallbackGuide() {
  return RESOURCES[current].chat ?? en.chat;
}
