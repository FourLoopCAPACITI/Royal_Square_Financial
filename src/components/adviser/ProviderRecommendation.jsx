import { useEffect, useState } from 'react';
import { Sparkles, RefreshCw, ChevronDown, ShieldCheck, Loader2, Check } from 'lucide-react';
import Card from '../common/Card.jsx';
import Button from '../common/Button.jsx';
import StatusBadge from '../common/StatusBadge.jsx';
import { analyseClient, CATEGORY_LABELS } from '../../utils/providerRecommendation.js';
import { listGoals } from '../../services/goalService.js';
import { listClaims } from '../../services/claimService.js';
import { listDocuments } from '../../services/documentService.js';
import { listClientProducts, listProviders } from '../../services/clientService.js';
import { formatDate, formatTime } from '../../utils/format.js';
import { useI18n } from '../../i18n/I18nContext.jsx';

const STEPS = ['goals', 'investments', 'protection', 'claims', 'netWorth', 'providers'];
const STEP_MS = 180; // the analysis itself is instant; this only paces the progress display
const CONFIDENCE = { high: ['🟢', 'success'], moderate: ['🟡', 'warning'], limited: ['🔴', 'red'] };
const IMPACT_TONE = { High: 'action', Medium: 'gold', Low: 'neutral', Context: 'neutral' };

/** Suitability bar — the shared ProgressBar has no per-provider label slot, so keep this tiny one local. */
function Bar({ value, label }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-brand-light-grey" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
      <div className="h-full rounded-full bg-strong" style={{ width: `${value}%` }} />
    </div>
  );
}

function ProviderCard({ provider, rank, t }) {
  return (
    <li className="rounded-lg border border-brand-border bg-surface p-4">
      <div className="mb-2 flex items-center gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-strong text-sm font-semibold text-white" aria-hidden="true">{provider.name[0]}</span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{rank}. {provider.name}</p>
          <p className="text-sm text-brand-grey">{t('rec.suitability', { score: provider.score })}</p>
        </div>
      </div>
      <Bar value={provider.score} label={`${provider.name} ${t('rec.suitability', { score: provider.score })}`} />
      {provider.reasons.length > 0 && (
        <>
          <p className="mb-1 mt-3 text-sm font-semibold">{t('rec.why')}</p>
          <ul className="list-disc space-y-1 pl-5 text-[15.5px]">{provider.reasons.map((r) => <li key={r}>{r}</li>)}</ul>
        </>
      )}
    </li>
  );
}

export default function ProviderRecommendation({ client, adviserId }) {
  const { t } = useI18n();
  const [phase, setPhase] = useState('idle'); // idle | loading | done | error
  const [stepIdx, setStepIdx] = useState(0);
  const [result, setResult] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // Reset when a different client is shown in this component instance.
  useEffect(() => { setPhase('idle'); setResult(null); setShowDetails(false); }, [client.id]);

  useEffect(() => {
    if (phase !== 'loading') return undefined;
    const id = setInterval(() => setStepIdx((i) => Math.min(i + 1, STEPS.length)), STEP_MS);
    return () => clearInterval(id);
  }, [phase]);

  async function run() {
    setPhase('loading');
    setStepIdx(0);
    try {
      // Same services (and Supabase RLS) the rest of the adviser portal uses; nothing leaves the app.
      const [goals, claims, documents, products, providers] = await Promise.all([
        listGoals({ adviserId }), listClaims({ adviserId }), listDocuments({ adviserId }), listClientProducts(client.id), listProviders(),
        new Promise((r) => setTimeout(r, STEP_MS * STEPS.length + 120)),
      ]);
      const providerName = (id) => providers.find((p) => p.id === id)?.name || null;
      setResult(analyseClient({ client, goals, claims, documents, products, providerName }));
      setPhase('done');
    } catch {
      setPhase('error');
    }
  }

  const generated = result && `${formatDate(result.generatedAt)}, ${formatTime(result.generatedAt)}`;

  return (
    <Card className="border-gold/50">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-semibold"><Sparkles size={18} className="text-gold-deep" aria-hidden="true" />{t('rec.title')}</h3>
          <p className="text-[15px] text-brand-grey">{t('rec.client', { name: client.name })}</p>
        </div>
        {phase !== 'loading' && (
          <Button size="sm" variant={phase === 'done' ? 'secondary' : 'primary'} icon={phase === 'done' ? RefreshCw : Sparkles} onClick={run}>
            {phase === 'done' ? t('rec.refresh') : t('rec.analyse')}
          </Button>
        )}
      </div>

      {phase === 'idle' && <p className="mt-3 text-[15.5px] text-brand-grey">{t('rec.intro')}</p>}
      {phase === 'error' && <p className="mt-3 text-danger" role="alert">{t('rec.error')}</p>}

      {phase === 'loading' && (
        <div className="mt-4" role="status">
          <p className="mb-2 flex items-center gap-2 font-semibold"><Loader2 size={16} className="animate-spin" aria-hidden="true" />{t('rec.analysing')}</p>
          <ul className="space-y-1 text-[15.5px]">
            {STEPS.map((s, i) => (
              <li key={s} className={`flex items-center gap-2 ${i < stepIdx ? '' : 'text-brand-grey'}`}>
                {i < stepIdx ? <Check size={15} className="text-ok" aria-hidden="true" /> : <span className="inline-block w-[15px]" />}
                {t(`rec.step.${s}`)}
              </li>
            ))}
          </ul>
        </div>
      )}

      {phase === 'done' && result.status === 'insufficient' && (
        <p className="mt-4 rounded-md bg-warn-tint p-3 font-semibold text-warn" role="status">{result.message}</p>
      )}

      {phase === 'done' && result.status === 'ok' && (
        <div className="mt-4 space-y-5">
          <p className="text-sm text-brand-grey">{t('rec.generated', { when: generated })}. {t('rec.basedOn')}</p>

          <div>
            <p className="mb-1 flex flex-wrap items-center gap-2 text-sm font-semibold uppercase tracking-wide text-brand-grey">
              {t('rec.confidence')}
              <StatusBadge tone={CONFIDENCE[result.confidence.level][1]}>{CONFIDENCE[result.confidence.level][0]} {t(`rec.confidence.${result.confidence.level}`)}</StatusBadge>
            </p>
            <p className="text-[15.5px]">{result.confidence.message}</p>
          </div>

          <div>
            <h4 className="mb-1 text-base font-semibold">{t('rec.suggested')}</h4>
            <p className="mb-3 text-sm italic text-brand-grey">{t('rec.suggestedNote')}</p>
            {result.noStrongRecommendation || !result.suggested.length ? (
              <p className="rounded-md bg-brand-light-grey p-3 text-[15.5px]">{t('rec.noStrong')}</p>
            ) : (
              <>
                {result.similar && <p className="mb-3 rounded-md bg-warn-tint p-3 text-[15.5px] text-warn">{t('rec.similar')}</p>}
                <ol className="grid gap-3 lg:grid-cols-3">{result.suggested.map((p, i) => <ProviderCard key={p.name} provider={p} rank={i + 1} t={t} />)}</ol>
              </>
            )}
          </div>

          {result.sections.length > 0 && (
            <div>
              <h4 className="mb-1 text-base font-semibold">{t('rec.byNeed')}</h4>
              <p className="mb-3 text-sm text-brand-grey">{t('rec.byNeedNote')}</p>
              <div className="grid gap-3 sm:grid-cols-3">
                {result.sections.map((s) => (
                  <div key={s.key} className="rounded-lg bg-brand-light-grey p-3">
                    <p className="font-semibold">{s.title}</p>
                    <p className="mb-2 text-sm text-brand-grey">{s.basis}</p>
                    <ul className="space-y-0.5 text-[15.5px]">
                      {s.providers.map((p) => <li key={p.name}>{p.name}{p.existing && <span className="ml-1 text-sm text-brand-grey">({t('rec.existing')})</span>}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h4 className="mb-2 text-base font-semibold">{t('rec.factors')}</h4>
            <div className="overflow-x-auto rounded-lg border border-brand-border">
              <table className="w-full text-left text-[15px]">
                <thead className="bg-brand-light-grey text-sm text-brand-grey">
                  <tr><th className="px-3 py-2 font-semibold">Factor</th><th className="px-3 py-2 font-semibold">Client information</th><th className="px-3 py-2 font-semibold">Impact</th></tr>
                </thead>
                <tbody className="divide-y divide-brand-border">
                  {result.factors.filter((f) => !f.hidden).map((f) => (
                    <tr key={f.factor}>
                      <td className="px-3 py-2 font-semibold">{f.factor}</td>
                      <td className={`px-3 py-2 ${f.available ? '' : 'text-brand-grey'}`}>{f.info}</td>
                      <td className="px-3 py-2">{f.available ? <StatusBadge tone={IMPACT_TONE[f.impact]}>{f.impact}</StatusBadge> : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <button type="button" onClick={() => setShowDetails((v) => !v)} aria-expanded={showDetails} className="flex items-center gap-1 text-sm font-semibold underline-offset-2 hover:underline">
              <ChevronDown size={16} className={`transition-transform ${showDetails ? 'rotate-180' : ''}`} aria-hidden="true" />
              {showDetails ? t('rec.hideDetails') : t('rec.details')}
            </button>
            {showDetails && (
              <div className="mt-3 overflow-x-auto rounded-lg border border-brand-border">
                <table className="w-full text-left text-[14.5px]">
                  <caption className="sr-only">{t('rec.allProviders')}</caption>
                  <thead className="bg-brand-light-grey text-sm text-brand-grey">
                    <tr>
                      <th className="px-3 py-2 font-semibold">{t('rec.allProviders')}</th>
                      {Object.keys(CATEGORY_LABELS).map((k) => <th key={k} className="px-3 py-2 font-semibold">{CATEGORY_LABELS[k]}</th>)}
                      <th className="px-3 py-2 font-semibold">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border tabular-nums">
                    {result.providers.map((p) => (
                      <tr key={p.name}>
                        <td className="px-3 py-2 font-semibold">{p.name}</td>
                        {Object.keys(CATEGORY_LABELS).map((k) => (
                          <td key={k} className="px-3 py-2">{p.breakdown[k] ? <>{p.breakdown[k].score}% <span className="text-brand-grey">×{p.breakdown[k].weight}%</span></> : <span className="text-brand-grey">n/a</span>}</td>
                        ))}
                        <td className="px-3 py-2 font-semibold">{p.score}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="border-t border-brand-border px-3 py-2 text-sm text-brand-grey">n/a = no client data for that category, or the provider does not serve it; remaining weights are re-normalised.</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-5 flex gap-2 rounded-md bg-brand-light-grey p-3 text-[13.5px] leading-snug text-brand-grey">
        <ShieldCheck size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
        <p><strong className="text-brand-black">{t('rec.disclaimerTitle')}</strong> {t('rec.disclaimer')}</p>
      </div>
    </Card>
  );
}
