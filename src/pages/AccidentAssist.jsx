/**
 * Accident Assist — 10-step guided capture.
 * Online: submits straight into a motor claim workflow.
 * Offline: saves the report on the device; syncService uploads it when connectivity returns.
 * Owned by feature/accident-assist.
 */
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, CloudOff, Send } from 'lucide-react';
import Button from '../components/common/Button.jsx';
import ProgressBar from '../components/common/ProgressBar.jsx';
import EvidenceChecklist from '../components/claims/EvidenceChecklist.jsx';
import {
  SafetyStep, LocationStep, SceneStep, VehicleStep, OtherDriverStep,
  RegistrationStep, InsuranceStep, WitnessesStep, DescriptionStep, ReviewStep,
} from '../components/claims/steps/AccidentSteps.jsx';
import { useCurrentClient } from '../hooks/useCurrentUser.js';
import { useConnectivity } from '../context/ConnectivityContext.jsx';
import { ACCIDENT_STEPS, createEmptyAccidentReport } from '../utils/claims.js';
import { clearDraft, loadDraft, saveDraft, savePendingReport } from '../services/offlineService.js';
import { createClaimFromReport } from '../services/claimService.js';
import { useI18n } from '../i18n/I18nContext.jsx';

const STEP_COMPONENTS = [SafetyStep, LocationStep, SceneStep, VehicleStep, OtherDriverStep, RegistrationStep, InsuranceStep, WitnessesStep, DescriptionStep, ReviewStep];

function OfflineNotice() {
  const { t } = useI18n();
  return (
    <div className="mb-6 flex gap-3 rounded-md border border-warn bg-warn-tint p-4" role="status">
      <CloudOff size={20} className="mt-0.5 shrink-0 text-warn" aria-hidden="true" />
      <div>
        <p className="font-semibold">{t('shell.offline')}</p>
        <p className="text-[16px]">{t('accident.offlineNotice')}</p>
      </div>
    </div>
  );
}

function Done({ result }) {
  const { t } = useI18n();
  return (
    <div className="mx-auto max-w-xl py-10 text-center">
      <CheckCircle2 size={48} className="mx-auto text-ok" aria-hidden="true" />
      {result.offline ? (
        <>
          <h1 className="mt-4 font-display text-2xl font-medium">{t('accident.savedTitle')}</h1>
          <p className="mt-2 text-brand-grey">{t('accident.savedText')}</p>
          <Button as={Link} to="/client" className="mt-6">{t('accident.backToDashboard')}</Button>
        </>
      ) : (
        <>
          <h1 className="mt-4 font-display text-2xl font-medium">{t('accident.sentTitle')}</h1>
          <p className="mt-2 text-brand-grey">{t('accident.sentText')}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Button as={Link} to={`/workflow/${result.workflowId}`}>{t('accident.trackClaim')}</Button>
            <Button as={Link} to="/client" variant="secondary">{t('accident.backToDashboard')}</Button>
          </div>
        </>
      )}
    </div>
  );
}

export default function AccidentAssist() {
  const { t, tx } = useI18n();
  const navigate = useNavigate();
  const client = useCurrentClient();
  const { online, refreshPending } = useConnectivity();
  const [report, setReport] = useState(() => loadDraft());
  const [index, setIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  // Start a fresh report once we know who the client is (or resume a saved draft).
  useEffect(() => {
    if (!report && client.data) setReport(createEmptyAccidentReport(client.data.id));
  }, [report, client.data]);

  // Every change is saved locally, so closing the app mid-way loses nothing.
  useEffect(() => {
    if (report && !result) saveDraft(report);
  }, [report, result]);

  if (result) return <Done result={result} />;
  if (!report) return <p className="py-10 text-brand-grey">{t('accident.preparing')}</p>;

  const update = (key, value) => setReport((r) => ({ ...r, [key]: value }));
  const Step = STEP_COMPONENTS[index];
  const step = ACCIDENT_STEPS[index];
  const isLast = index === ACCIDENT_STEPS.length - 1;
  const ownRegistration = client.data?.vehicle?.split('·')[1]?.trim();

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      if (!online) {
        savePendingReport(report);
        refreshPending();
        clearDraft();
        setResult({ offline: true });
      } else {
        const { workflow } = await createClaimFromReport(report);
        clearDraft();
        setResult({ offline: false, workflowId: workflow.id });
      }
    } catch (err) {
      // Never lose a report: fall back to the offline queue.
      savePendingReport(report);
      refreshPending();
      setError(t('accident.errorSaved', { message: err.message }));
    } finally {
      setBusy(false);
    }
  }

  function cancel() {
    clearDraft();
    navigate(-1);
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="label-muted">{t('accident.title')}</p>
          <h1 className="font-display text-[26px] font-medium leading-tight">{tx(step.label)}</h1>
          <p className="text-[15.5px] text-brand-grey">{t('accident.stepOf', { step: index + 1, total: ACCIDENT_STEPS.length })}</p>
        </div>
        <button type="button" onClick={cancel} className="text-[15.5px] font-semibold text-brand-grey hover:text-brand-black">{t('common.cancel')}</button>
      </div>

      <ProgressBar value={((index + 1) / ACCIDENT_STEPS.length) * 100} label={t('accident.progress')} className="mb-6" />

      {!online && <OfflineNotice />}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div>
          <Step report={report} update={update} goTo={setIndex} defaultOwnRegistration={ownRegistration} />

          {error && <p className="mt-4 rounded-md bg-warn-tint p-3 text-[15.5px]" role="alert">{error}</p>}

          <div className="mt-8 flex items-center justify-between gap-3 border-t border-brand-border pt-5">
            <Button variant="ghost" onClick={() => setIndex((i) => i - 1)} disabled={index === 0} icon={ArrowLeft}>{t('common.back')}</Button>
            {isLast ? (
              <Button size="lg" onClick={submit} disabled={busy} icon={online ? Send : CloudOff}>
                {busy ? t('accident.saving') : online ? t('accident.sendOnline') : t('accident.saveOffline')}
              </Button>
            ) : (
              <Button onClick={() => setIndex((i) => i + 1)}>
                {index === 0 ? t('accident.continue') : t('accident.next')} <ArrowRight size={18} aria-hidden="true" />
              </Button>
            )}
          </div>
        </div>

        <aside className="space-y-4">
          <EvidenceChecklist report={report} />
          <ol className="hidden space-y-1 text-[15.5px] lg:block" aria-label={t('accident.steps')}>
            {ACCIDENT_STEPS.map((s, i) => (
              <li key={s.key}>
                <button
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-current={i === index ? 'step' : undefined}
                  className={`w-full rounded px-2 py-1 text-left ${i === index ? 'bg-brand-red-tint font-semibold text-brand-red' : 'text-brand-grey hover:text-brand-black'}`}
                >
                  {i + 1}. {tx(s.label)}
                </button>
              </li>
            ))}
          </ol>
        </aside>
      </div>
    </div>
  );
}
