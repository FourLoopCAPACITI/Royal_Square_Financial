import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, Square } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Button from '../../components/common/Button.jsx';
import NamedIcon from '../../components/common/NamedIcon.jsx';
import WorkflowOwner from '../../components/workflows/WorkflowOwner.jsx';
import { useCurrentClient } from '../../hooks/useCurrentUser.js';
import { LIFE_EVENTS, reportMove } from '../../services/lifeEventService.js';
import { useI18n, validationProps } from '../../i18n/I18nContext.jsx';

function PlanList({ title, items, done }) {
  const { tx } = useI18n();
  return (
    <div>
      <p className="mb-2 font-semibold">{title}</p>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-2 text-[16.5px]">
            {done ? <Check size={16} className="text-ok" aria-hidden="true" /> : <Square size={16} className="text-brand-grey" aria-hidden="true" />}
            {tx(item)}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function LifeEvents() {
  const { t, tx } = useI18n();
  const client = useCurrentClient();
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);
  const [address, setAddress] = useState('');
  const [busy, setBusy] = useState(false);
  const [outcome, setOutcome] = useState(null);

  async function submitMove(e) {
    e.preventDefault();
    setBusy(true);
    const result = await reportMove({ clientId: client.data.id, newAddress: address });
    setOutcome(result);
    setBusy(false);
  }

  return (
    <>
      <PageHeader title={t('life.title')} description={t('life.description')} />

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {LIFE_EVENTS.map((ev) => (
          <button
            key={ev.key}
            type="button"
            onClick={() => (ev.route ? navigate(ev.route) : (setSelected(ev.key), setOutcome(null)))}
            aria-pressed={selected === ev.key}
            className="option-tile"
          >
            <NamedIcon name={ev.icon} size={20} className="mt-0.5 shrink-0 text-brand-red" />
            <span>
              <span className="block font-semibold">{tx(ev.label)}</span>
              <span className="block text-[15px] text-text-secondary">{tx(ev.description)}</span>
            </span>
          </button>
        ))}
      </div>

      {selected === 'moved' && !outcome && (
        <form onSubmit={submitMove} className="mt-6 max-w-xl space-y-4 rounded-lg border border-gold bg-surface shadow-card p-5">
          <p className="font-display text-lg font-medium">{t('life.moved.title')}</p>
          <div>
            <label htmlFor="new-address" className="field-label">{t('life.moved.address')}</label>
            <textarea id="new-address" rows={3} className="field" value={address} onChange={(e) => setAddress(e.target.value)} placeholder={t('life.moved.placeholder')} required {...validationProps()} />
          </div>
          <Button type="submit" disabled={busy || !client.data}>{busy ? t('life.moved.submitting') : t('life.moved.submit')}</Button>
        </form>
      )}

      {selected && selected !== 'moved' && (
        <div className="mt-6 max-w-xl rounded-md border border-dashed border-brand-border p-5">
          <p className="font-semibold">{t('life.comingSoon')}</p>
          <p className="text-[16px] text-brand-grey">{t('life.comingSoonHint')}</p>
          <Link to="/client/requests" className="mt-2 inline-block font-semibold text-brand-red hover:underline">{t('life.goToRequests')}</Link>
        </div>
      )}

      {outcome && (
        <div className="mt-6 rounded-lg border border-brand-border bg-surface shadow-card p-5 sm:p-6" role="status">
          <p className="text-[15.5px] text-ok">{t('life.created')}</p>
          <h2 className="mt-1 text-2xl font-normal">{t('life.outcomeTitle')}</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            <PlanList title={t('life.affected')} items={outcome.plan.affected} done />
            <PlanList title={t('life.needed')} items={outcome.plan.neededFromYou} />
            <PlanList title={t('life.willDo')} items={outcome.plan.royalSquareWill} />
          </div>
          <div className="mt-6">
            <WorkflowOwner workflow={outcome.workflow} viewerRole="client" compact />
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button as={Link} to="/client/documents">{t('life.uploadProof')}</Button>
            <Button as={Link} to={`/workflow/${outcome.workflow.id}`} variant="secondary">{t('life.trackProgress')}</Button>
          </div>
        </div>
      )}
    </>
  );
}
