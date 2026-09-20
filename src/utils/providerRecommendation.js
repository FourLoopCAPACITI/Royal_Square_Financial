/**
 * Simulated provider suitability — a transparent, deterministic rule engine. NO AI/LLM, NO network.
 * Pure function of the client's already-stored data; nothing here is financial advice.
 *
 * Provider "affinity" tables below are coarse DEMO assumptions about where each brand's focus lies
 * (0–1). They are not product assessments. Change them here; nothing else hardcodes provider claims.
 */

/** Category weights (sum 100). Categories with no client data are dropped and the rest re-normalised. */
export const WEIGHTS = { goals: 25, investment: 20, risk: 15, financial: 15, protection: 15, relationship: 10 };
export const CATEGORY_LABELS = {
  goals: 'Goals alignment', investment: 'Investment alignment', risk: 'Risk alignment',
  financial: 'Financial position', protection: 'Protection needs', relationship: 'Existing relationship',
};

// Needs: retirement, wealth (general investing/saving), education, life, health, shortTerm (personal/general insurance).
const PROVIDERS = {
  Sanlam: { retirement: 0.9, wealth: 0.7, education: 0.6, life: 0.9, health: 0.3, shortTerm: 0.4, horizon: { short: 0.4, medium: 0.7, long: 0.9 }, risk: { conservative: 0.7, moderate: 0.85, growth: 0.7 } },
  'Old Mutual': { retirement: 0.85, wealth: 0.8, education: 0.6, life: 0.8, health: 0.3, shortTerm: 0.3, horizon: { short: 0.4, medium: 0.7, long: 0.9 }, risk: { conservative: 0.6, moderate: 0.8, growth: 0.8 } },
  Liberty: { retirement: 0.7, wealth: 0.6, education: 0.7, life: 0.85, health: 0.5, shortTerm: 0.2, horizon: { short: 0.5, medium: 0.7, long: 0.7 }, risk: { conservative: 0.7, moderate: 0.75, growth: 0.6 } },
  Momentum: { retirement: 0.75, wealth: 0.75, education: 0.6, life: 0.85, health: 0.8, shortTerm: 0.3, horizon: { short: 0.5, medium: 0.75, long: 0.8 }, risk: { conservative: 0.7, moderate: 0.8, growth: 0.7 } },
  Discovery: { retirement: 0.55, wealth: 0.6, education: 0.4, life: 0.8, health: 0.95, shortTerm: 0.5, horizon: { short: 0.4, medium: 0.6, long: 0.6 }, risk: { conservative: 0.6, moderate: 0.7, growth: 0.6 } },
  'Allan Gray': { retirement: 0.85, wealth: 0.95, education: 0.7, life: 0, health: 0, shortTerm: 0, horizon: { short: 0.2, medium: 0.7, long: 1 }, risk: { conservative: 0.4, moderate: 0.75, growth: 0.95 } },
  Santam: { retirement: 0, wealth: 0, education: 0, life: 0, health: 0, shortTerm: 0.95, horizon: { short: 0, medium: 0, long: 0 }, risk: { conservative: 0, moderate: 0, growth: 0 } },
};
export const PROVIDER_NAMES = Object.keys(PROVIDERS);

const NEED_LABEL = { retirement: 'retirement', wealth: 'wealth-creation / savings', education: "children's education", life: 'life cover', health: 'health cover', shortTerm: 'personal / general insurance' };
const GOAL_NEED = { retirement: 'retirement', education: 'education' }; // any other category is a savings / wealth need
const RISK_BUCKET = { conservative: 'conservative', moderate: 'moderate', balanced: 'moderate', growth: 'growth', aggressive: 'growth' };
const YEAR_MS = 365.25 * 24 * 3600 * 1000;
const MIN_SCORE = 50; // below this a provider is not suggested
const SIMILAR_SPREAD = 5;

const has = (v) => v !== null && v !== undefined && v !== '';
const rand = (n) => `R${Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
const list = (a) => (a.length > 1 ? `${a.slice(0, -1).join(', ')} and ${a[a.length - 1]}` : a[0] || '');
const isType = (p, re) => re.test(p.type || '');
const isActive = (p) => !p.status || p.status === 'active';

/** Derive every fact the scoring uses, straight from the stored records. */
function profileFacts({ client, goals, products, claims, documents, providerName, now }) {
  const nowMs = now.getTime();
  const age = has(client.dateOfBirth) ? Math.floor((nowMs - new Date(client.dateOfBirth).getTime()) / YEAR_MS) : null;
  const assets = Number(client.totalAssets) || 0;
  const liabilities = Number(client.totalLiabilities) || 0;
  const hasBalanceSheet = assets > 0 || liabilities > 0;

  const held = products.filter(isActive).map((p) => ({ ...p, provider: providerName(p.providerId) }));
  const investments = held.filter((p) => isType(p, /invest|retirement|annuity|savings|unit trust|tfsa/i));
  const lifeCover = held.filter((p) => isType(p, /life|funeral|disability/i));
  const healthCover = held.filter((p) => isType(p, /health|medical/i));
  const shortTerm = held.filter((p) => isType(p, /vehicle|personal|home|household|commercial|short-term/i));
  const investmentDocs = documents.filter((d) => d.type === 'investment_statement' && d.status !== 'missing');

  const goalFacts = goals.map((g) => {
    const years = has(g.targetDate) ? Math.max(0, (new Date(g.targetDate).getTime() - nowMs) / YEAR_MS) : null;
    return { ...g, need: GOAL_NEED[String(g.category || '').toLowerCase()] || 'wealth', years, shortfall: Math.max(0, g.targetAmount - g.currentAmount) };
  });
  const horizons = goalFacts.map((g) => g.years).filter((y) => y !== null);
  const bucket = (y) => (y < 3 ? 'short' : y < 7 ? 'medium' : 'long');
  const horizon = horizons.length ? { min: Math.min(...horizons), max: Math.max(...horizons), bucket: bucket(Math.max(...horizons)) } : null;

  const capacity = hasBalanceSheet && assets > 0
    ? Math.max(0, Math.min(1, (Math.min(assets - liabilities, 4_000_000) / 4_000_000) * 0.7 + (1 - Math.min(liabilities / assets, 1)) * 0.3))
    : null;

  return {
    client, age, assets, liabilities, netWorth: assets - liabilities, hasBalanceSheet, capacity,
    debtRatio: assets > 0 ? liabilities / assets : null,
    held, investments, lifeCover, healthCover, shortTerm, investmentDocs, goals: goalFacts, horizon, claims,
    riskBucket: RISK_BUCKET[String(client.riskProfile || '').toLowerCase()] || null,
    primaryGoal: [...goalFacts].sort((a, b) => b.shortfall - a.shortfall)[0] || null,
  };
}

/** Protection needs: a recorded gap counts fully; cover already held counts less (review only). */
function protectionNeeds(f) {
  const motorClaims = f.claims.filter((c) => /motor|vehicle/i.test(c.type || '')).length;
  return [
    { need: 'life', weight: f.lifeCover.length ? 0.3 : 1, why: f.lifeCover.length ? `existing life cover recorded (${list(f.lifeCover.map((p) => p.provider || p.type))})` : 'no life cover recorded' },
    { need: 'health', weight: f.healthCover.length ? 0.3 : 0.6, why: f.healthCover.length ? 'existing health cover recorded' : 'no health protection recorded' },
    { need: 'shortTerm', weight: f.shortTerm.length ? (f.claims.length ? 0.6 : 0.3) : 0.6, why: f.shortTerm.length ? `${f.shortTerm.length} personal/general insurance product(s) recorded${motorClaims ? ` and ${motorClaims} motor claim(s) on file` : ''}` : 'no personal/general insurance recorded' },
  ];
}

/** Each scorer returns { score 0-1 | null, reasons: [string] } for one provider. */
function scoreProvider(name, f) {
  const p = PROVIDERS[name];
  const out = {};

  // Goals: average affinity across the client's recorded goals.
  if (f.goals.length) {
    const reasons = f.goals.filter((g) => p[g.need === 'wealth' ? 'wealth' : g.need] >= 0.6)
      .map((g) => `${p[g.need] >= 0.75 ? 'Strong' : 'Potential'} alignment with the client's ${g.name} goal (${g.category || 'general'})`);
    out.goals = { score: f.goals.reduce((s, g) => s + p[g.need], 0) / f.goals.length, reasons: reasons.slice(0, 2) };
  } else out.goals = { score: null, reasons: [] };

  // Investment: need affinity blended with the recorded horizon; needs an investment signal.
  const signal = f.investments.length || f.investmentDocs.length || f.goals.length;
  if (signal) {
    const need = f.investments.some((i) => isType(i, /retirement|annuity/i)) || f.goals.some((g) => g.need === 'retirement') ? 'retirement' : 'wealth';
    const fit = f.horizon ? 0.7 * p[need] + 0.3 * p.horizon[f.horizon.bucket] : p[need];
    const reasons = [];
    if (p[need] >= 0.6) reasons.push(`Potential alignment with ${NEED_LABEL[need]} investment objectives`);
    if (f.horizon && p.horizon[f.horizon.bucket] >= 0.8) reasons.push(`Appears compatible with the client's recorded ${f.horizon.bucket}-term horizon (up to ${Math.round(f.horizon.max)} years)`);
    out.investment = { score: fit, reasons };
  } else out.investment = { score: null, reasons: [] };

  // Risk: only when a risk profile is actually stored (none is today).
  out.risk = f.riskBucket
    ? { score: p.risk[f.riskBucket], reasons: p.risk[f.riskBucket] >= 0.7 ? [`Fits the client's recorded ${f.client.riskProfile} risk profile`] : [] }
    : { score: null, reasons: [] };

  // Financial position: capacity high → investment-led providers, low → protection-led providers.
  if (f.capacity !== null) {
    const invest = Math.max(p.retirement, p.wealth);
    const protect = Math.max(p.life, p.health, p.shortTerm);
    out.financial = {
      score: f.capacity * invest + (1 - f.capacity) * protect,
      reasons: f.capacity >= 0.5 && invest >= 0.75 && f.netWorth > 0 ? [`Net worth of ${rand(f.netWorth)} indicates capacity for long-term contributions`]
        : f.capacity < 0.5 && protect >= 0.75 ? [`Recorded net worth (${rand(f.netWorth)}) and liabilities suggest protection cover may be a priority`] : [],
    };
  } else out.financial = { score: null, reasons: [] };

  // Protection: weighted affinity over gaps / cover to review.
  const needs = protectionNeeds(f);
  const totalW = needs.reduce((s, n) => s + n.weight, 0);
  out.protection = {
    score: needs.reduce((s, n) => s + n.weight * p[n.need], 0) / totalW,
    reasons: needs.filter((n) => p[n.need] >= 0.75).sort((a, b) => b.weight - a.weight).slice(0, 2).map((n) => `Relevant to the client's ${NEED_LABEL[n.need]} needs (${n.why})`),
  };

  // Relationship: products already recorded with this provider (and claims handled by them).
  const mine = f.held.filter((h) => h.provider === name);
  const claimsHere = f.claims.filter((c) => c.provider === name).length;
  if (f.held.length) {
    out.relationship = {
      score: mine.length ? Math.min(1, 0.6 + 0.2 * mine.length) : 0,
      reasons: mine.length ? [`Client already holds ${mine.length} recorded product(s) with ${name} (${list(mine.map((m) => m.type))})${claimsHere ? `, with ${claimsHere} claim(s) on file` : ''}`] : [],
    };
  } else out.relationship = { score: null, reasons: [] };

  // A provider isn't penalised for a need it doesn't serve: that category is dropped for it (not scored 0).
  if (!Math.max(p.retirement, p.wealth, p.education)) { out.goals.score = null; out.investment.score = null; }
  if (!Math.max(p.life, p.health, p.shortTerm)) out.protection.score = null;

  // Combine, re-normalising over categories that have data.
  const used = Object.keys(WEIGHTS).filter((k) => out[k].score !== null);
  const wSum = used.reduce((s, k) => s + WEIGHTS[k], 0);
  const total = used.reduce((s, k) => s + WEIGHTS[k] * out[k].score, 0) / wSum;
  const breakdown = Object.fromEntries(Object.keys(WEIGHTS).map((k) => [k, out[k].score === null ? null : { score: Math.round(out[k].score * 100), weight: Math.round((WEIGHTS[k] / wSum) * 100) }]));
  const reasons = used.sort((a, b) => WEIGHTS[b] * out[b].score - WEIGHTS[a] * out[a].score).flatMap((k) => out[k].reasons);
  return { name, score: Math.round(total * 100), breakdown, reasons: reasons.slice(0, 5), heldProducts: mine.map((m) => m.type) };
}

/** Investment / protection / general-insurance shortlist, from need affinity only. */
function needSections(f) {
  const rank = (needs, heldList) => PROVIDER_NAMES
    .map((n) => ({ name: n, fit: Math.max(...needs.map((k) => PROVIDERS[n][k])) }))
    .filter((r) => r.fit >= 0.7).sort((a, b) => b.fit - a.fit).slice(0, 3)
    .map((r) => ({ name: r.name, existing: heldList.some((h) => h.provider === r.name) }));
  const sections = [];
  if (f.investments.length || f.investmentDocs.length || f.goals.length) {
    const needs = f.goals.length ? [...new Set(f.goals.map((g) => g.need))] : ['wealth'];
    sections.push({ key: 'investment', title: 'Investment needs', providers: rank(needs, f.investments),
      basis: f.goals.length ? `Based on the client's ${list(f.goals.map((g) => g.name))} goal(s)${f.investments.length ? ' and existing investments' : ''}` : 'Based on existing investments recorded' });
  }
  const [life, health, general] = protectionNeeds(f);
  const protect = [life, health].filter((n) => n.weight >= 0.6).map((n) => n.need);
  sections.push({ key: 'protection', title: 'Life / protection needs', basis: list([life.why, health.why]), providers: rank(protect.length ? protect : ['life', 'health'], [...f.lifeCover, ...f.healthCover]) });
  sections.push({ key: 'general', title: 'Personal / general insurance', basis: general.why, providers: rank(['shortTerm'], f.shortTerm) });
  return sections.filter((s) => s.providers.length);
}

/** What was and wasn't available — drives both the factors table and confidence. */
function factors(f) {
  const NA = null;
  const g = f.goals;
  const claimTypes = [...new Set(f.claims.map((c) => c.type).filter(Boolean))];
  const rows = [
    { factor: 'Primary goal', info: f.primaryGoal ? `${f.primaryGoal.name} (${f.primaryGoal.category || 'general'})` : NA, impact: 'High', weight: 2 },
    { factor: 'All recorded goals', info: g.length ? list(g.map((x) => x.name)) : NA, impact: 'High', weight: 2, hidden: true },
    { factor: 'Risk profile', info: f.riskBucket ? f.client.riskProfile : NA, impact: 'High', weight: 2 },
    { factor: 'Investment horizon', info: f.horizon ? (f.horizon.max - f.horizon.min < 1 ? `About ${Math.round(f.horizon.max)} year(s)` : `${Math.round(f.horizon.min)}–${Math.round(f.horizon.max)} years`) + ' (from goal dates)' : NA, impact: 'High', weight: 1 },
    { factor: 'Net worth', info: f.hasBalanceSheet ? `${rand(f.netWorth)} (assets ${rand(f.assets)}, liabilities ${rand(f.liabilities)})` : NA, impact: 'Medium', weight: 2 },
    { factor: 'Existing investments', info: f.investments.length || f.investmentDocs.length ? list([...f.investments.map((p) => `${p.type}${p.provider ? ` (${p.provider})` : ''}`), ...(f.investmentDocs.length ? [`${f.investmentDocs.length} investment statement(s) on file`] : [])]) : NA, impact: 'Medium', weight: 1, key: 'investments' },
    { factor: 'Existing policies / protection', info: f.held.length ? `${list(f.held.map((p) => `${p.type}${p.provider ? ` (${p.provider})` : ''}`))}${f.lifeCover.length ? '' : '. No life cover recorded'}` : NA, impact: 'High', weight: 1 },
    { factor: 'Claims history', info: f.claims.length ? `${f.claims.length} claim(s)${claimTypes.length ? ` — ${claimTypes.join(', ')}` : ''}` : NA, impact: 'Low', weight: 0 },
    { factor: 'Monthly income', info: has(f.client.monthlyIncome) ? rand(f.client.monthlyIncome) : NA, impact: 'Medium', weight: 2 },
    { factor: 'Monthly expenses', info: has(f.client.monthlyExpenses) ? rand(f.client.monthlyExpenses) : NA, impact: 'Medium', weight: 1 },
    { factor: 'Dependants', info: has(f.client.dependants) ? String(f.client.dependants) : NA, impact: 'Medium', weight: 1 },
    { factor: 'Investment preferences', info: has(f.client.investmentPreferences) ? String(f.client.investmentPreferences) : NA, impact: 'Medium', weight: 1 },
    { factor: 'Age', info: f.age !== null ? `${f.age}` : NA, impact: 'Context', weight: 1 },
    { factor: 'Occupation', info: has(f.client.occupation) ? f.client.occupation : NA, impact: 'Context', weight: 1 },
    { factor: 'Household', info: f.client.householdId ? 'Member of a shared household (household goals included)' : NA, impact: 'Context', weight: 1 },
  ];
  return rows.map((r) => ({ ...r, available: r.info !== NA, info: r.info ?? 'Not available' }));
}

function confidenceOf(rows) {
  const scored = rows.filter((r) => r.weight > 0 && !r.hidden);
  const total = scored.reduce((s, r) => s + r.weight, 0);
  const got = scored.filter((r) => r.available).reduce((s, r) => s + r.weight, 0);
  const ratio = got / total;
  const missing = scored.filter((r) => !r.available).map((r) => r.factor.toLowerCase());
  const riskMissing = rows.find((r) => r.factor === 'Risk profile' && !r.available);
  let level = ratio >= 0.75 ? 'high' : ratio >= 0.45 ? 'moderate' : 'limited';
  if (riskMissing && level === 'high') level = 'moderate'; // never "high" without a recorded risk profile
  const message = level === 'high' ? 'Most relevant client information is recorded.'
    : `Confidence is ${level === 'moderate' ? 'moderate' : 'limited'} because the client's ${list(missing.slice(0, 4))} ${missing.length === 1 ? 'has' : 'have'} not been recorded.`;
  return { level, percent: Math.round(ratio * 100), message, missing };
}

/**
 * @param {object} input { client, goals, products, claims, documents, providerName(id), now? }
 * @returns {object} result — status 'insufficient' | 'ok'
 */
export function analyseClient({ client, goals = [], products = [], claims = [], documents = [], providerName = () => null, now = new Date() }) {
  const ownGoals = goals.filter((g) => g.clientId === client.id || (g.householdId && g.householdId === client.householdId));
  const ownProducts = products.filter((p) => p.clientId === client.id);
  const ownClaims = claims.filter((c) => c.clientId === client.id).map((c) => ({ ...c, provider: providerName(c.providerId) }));
  const ownDocs = documents.filter((d) => d.clientId === client.id);
  const f = profileFacts({ client, goals: ownGoals, products: ownProducts, claims: ownClaims, documents: ownDocs, providerName, now });
  const generatedAt = now.toISOString();

  if (!f.hasBalanceSheet && !f.goals.length && !f.held.length && !ownClaims.length && !f.investmentDocs.length) {
    return { status: 'insufficient', generatedAt, message: 'Insufficient information to generate a meaningful simulated recommendation.', factors: factors(f) };
  }

  const rows = factors(f);
  const scored = PROVIDER_NAMES.map((n) => scoreProvider(n, f)).sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
  const confidence = confidenceOf(rows);
  const suggested = scored.filter((s) => s.score >= MIN_SCORE).slice(0, 3);
  const similar = suggested.length > 1 && suggested[0].score - suggested[suggested.length - 1].score <= SIMILAR_SPREAD * 2 && suggested[0].score - suggested[1].score <= SIMILAR_SPREAD;
  return {
    status: 'ok', generatedAt, confidence, factors: rows, providers: scored, suggested,
    noStrongRecommendation: suggested.length === 0 || (confidence.level === 'limited' && suggested[0].score < 65),
    similar, sections: needSections(f),
    missing: confidence.missing,
  };
}
