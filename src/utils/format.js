/** Formatting helpers (South African locale). Pure functions, no React. */
const DAY_MS = 24 * 60 * 60 * 1000;

/** 1240000 → "R1,240,000" */
export function formatZAR(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—';
  const n = Math.round(Number(value));
  const sign = n < 0 ? '-' : '';
  return `${sign}R${Math.abs(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}

export function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function formatShortDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' });
}

export function formatTime(value) {
  if (!value) return '';
  return new Date(value).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit', hour12: false });
}

export function startOfDay(value = new Date()) {
  const d = new Date(value);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Whole days from today until the date (negative when in the past). */
export function daysUntil(value, now = new Date()) {
  if (!value) return null;
  return Math.round((startOfDay(value) - startOfDay(now)) / DAY_MS);
}

export function daysSince(value, now = new Date()) {
  const d = daysUntil(value, now);
  return d === null ? null : -d;
}

export function describeDue(value, now = new Date()) {
  const d = daysUntil(value, now);
  if (d === null) return 'No due date';
  if (d === 0) return 'Due today';
  if (d === 1) return 'Due tomorrow';
  if (d > 1) return `Due in ${d} days`;
  if (d === -1) return '1 day overdue';
  return `${Math.abs(d)} days overdue`;
}

export function describeWaiting(value, now = new Date()) {
  const d = daysSince(value, now);
  if (d === null || d <= 0) return 'Waiting since today';
  return d === 1 ? 'Waiting 1 day' : `Waiting ${d} days`;
}

/** "Today", "Yesterday" or a full date — used on activity timelines. */
export function describeDay(value, now = new Date()) {
  const d = daysUntil(value, now);
  if (d === 0) return 'Today';
  if (d === -1) return 'Yesterday';
  return formatDate(value);
}

export function daysFromNow(days, hour = 9, minute = 0, base = new Date()) {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

export function percent(current, target) {
  if (!target) return 0;
  return Math.max(0, Math.min(100, Math.round((Number(current) / Number(target)) * 100)));
}

export function uid(prefix = 'id') {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}
