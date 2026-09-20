import test from 'node:test';
import assert from 'node:assert/strict';
import { analyseClient } from '../src/utils/providerRecommendation.js';

const now = new Date('2026-09-20T10:42:00Z');
const names = { p1: 'Santam', p2: 'Discovery', p3: 'Sanlam', p4: 'Momentum', p5: 'Allan Gray' };
const providerName = (id) => names[id] || null;
const yrs = (n) => new Date(now.getTime() + n * 365.25 * 864e5).toISOString();
const run = (client, extra = {}) => analyseClient({ client: { id: 'c', dateOfBirth: '1990-01-01', occupation: 'Analyst', ...client }, providerName, now, ...extra });
const goal = (name, category, years, target = 1e6, current = 1e5) => ({ clientId: 'c', name, category, targetAmount: target, currentAmount: current, targetDate: yrs(years) });
const prod = (type, providerId) => ({ clientId: 'c', type, providerId });
const top = (r) => r.suggested.map((s) => s.name);

test('complete client: scores, reasons from real data, no risk profile => not high confidence', () => {
  const r = run({ totalAssets: 1530000, totalLiabilities: 290000 }, {
    goals: [goal('Retirement top-up', 'Retirement', 20)], claims: [{ clientId: 'c', type: 'motor', providerId: 'p1' }],
    products: [prod('Investment', 'p5'), prod('Life cover', 'p3'), prod('Vehicle insurance', 'p1')],
  });
  assert.equal(r.status, 'ok');
  assert.ok(r.suggested.length >= 1 && r.suggested[0].score >= 50);
  assert.ok(r.suggested[0].reasons.length > 0);
  assert.notEqual(r.confidence.level, 'high');
  assert.equal(r.factors.find((f) => f.factor === 'Risk profile').info, 'Not available');
  assert.match(r.providers.find((p) => p.name === 'Allan Gray').reasons.join(' '), /already holds 1 recorded product/);
  assert.match(r.factors.find((f) => f.factor === 'Claims history').info, /1 claim/);
});

test('partial client: works, limited confidence, missing data named', () => {
  const r = run({}, { goals: [goal('Emergency Fund', 'Safety net', 1)] });
  assert.equal(r.status, 'ok');
  assert.equal(r.confidence.level, 'limited');
  assert.match(r.confidence.message, /not been recorded/);
  assert.equal(r.factors.find((f) => f.factor === 'Net worth').info, 'Not available');
});

test('no financial information: insufficient, nothing invented', () => {
  const r = run({});
  assert.equal(r.status, 'insufficient');
  assert.match(r.message, /Insufficient information/);
});

test('other clients\' records are ignored', () => {
  const r = run({}, { goals: [{ ...goal('Theirs', 'Retirement', 5), clientId: 'other' }], products: [{ ...prod('Life cover', 'p3'), clientId: 'other' }] });
  assert.equal(r.status, 'insufficient');
});

test('different profiles give different outcomes', () => {
  const wealth = run({ dateOfBirth: '2000-01-01', totalAssets: 300000, totalLiabilities: 20000 }, { goals: [goal('Grow savings', 'Wealth', 15)], products: [prod('Investment', 'p5')] });
  const protection = run({ totalAssets: 900000, totalLiabilities: 800000 }, { goals: [goal('Emergency Fund', 'Safety net', 1)], products: [prod('Vehicle insurance', 'p1')], claims: [{ clientId: 'c', type: 'motor', providerId: 'p1' }] });
  const hnw = run({ totalAssets: 9e6, totalLiabilities: 3e5 }, { goals: [goal('Retirement', 'Retirement', 12, 5e6, 3e6)] });
  assert.equal(wealth.suggested[0].name, 'Allan Gray');
  assert.ok(!top(protection).includes('Allan Gray'));
  assert.notDeepEqual(top(wealth), top(protection));
  assert.match(hnw.suggested[0].reasons.join(' '), /capacity for long-term contributions/);
  assert.ok(protection.sections.some((s) => s.key === 'general' && s.providers[0].name === 'Santam'));
});

test('risk profile, when stored, is used and raises confidence', () => {
  const base = { totalAssets: 1e6, totalLiabilities: 1e5 };
  const ctx = { goals: [goal('Wealth', 'Wealth', 15)], products: [prod('Investment', 'p5')] };
  const a = run(base, ctx), b = run({ ...base, riskProfile: 'Growth' }, ctx);
  assert.equal(a.providers.find((p) => p.name === 'Allan Gray').breakdown.risk, null);
  assert.ok(b.providers.find((p) => p.name === 'Allan Gray').breakdown.risk.score >= 90);
  assert.ok(b.confidence.percent > a.confidence.percent);
});

test('deterministic', () => {
  const c = { totalAssets: 1e6 }, x = { goals: [goal('Retirement', 'Retirement', 9)] };
  assert.deepEqual(run(c, x), run(c, x));
});
