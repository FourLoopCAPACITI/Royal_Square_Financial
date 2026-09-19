import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, Square } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Button from '../../components/common/Button.jsx';
import NamedIcon from '../../components/common/NamedIcon.jsx';
import WorkflowOwner from '../../components/workflows/WorkflowOwner.jsx';
import { useCurrentClient } from '../../hooks/useCurrentUser.js';
import { LIFE_EVENTS, reportMove } from '../../services/lifeEventService.js';

function PlanList({ title, items, done }) {
  return (
    <div>
      <p className="mb-2 font-semibold">{title}</p>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-2 text-[15px]">
            {done ? <Check size={16} className="text-ok" aria-hidden="true" /> : <Square size={16} className="text-brand-grey" aria-hidden="true" />}
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function LifeEvents() {
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
      <PageHeader title="Life events" description="Tell us once. We work out what needs to change across your policies and coordinate it." />

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {LIFE_EVENTS.map((ev) => (
          <button
            key={ev.key}
            type="button"
            onClick={() => (ev.route ? navigate(ev.route) : (setSelected(ev.key), setOutcome(null)))}
            aria-pressed={selected === ev.key}
            className={`flex items-start gap-3 rounded-md border p-4 text-left transition-colors ${selected === ev.key ? 'border-brand-red bg-brand-red-tint' : 'border-brand-border hover:border-brand-black'}`}
          >
            <NamedIcon name={ev.icon} size={20} className="mt-0.5 shrink-0 text-brand-red" />
            <span>
              <span className="block font-semibold">{ev.label}</span>
              <span className="block text-[13.5px] text-brand-grey">{ev.description}</span>
            </span>
          </button>
        ))}
      </div>

      {selected === 'moved' && !outcome && (
        <form onSubmit={submitMove} className="mt-6 max-w-xl space-y-4 rounded-md border border-brand-black p-5">
          <p className="font-display text-lg font-medium">Where have you moved to?</p>
          <div>
            <label htmlFor="new-address" className="field-label">New address</label>
            <textarea id="new-address" rows={3} className="field" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street, suburb, city, postal code" required />
          </div>
          <Button type="submit" disabled={busy || !client.data}>{busy ? 'Setting up…' : 'Update my address'}</Button>
        </form>
      )}

      {selected && selected !== 'moved' && (
        <div className="mt-6 max-w-xl rounded-md border border-dashed border-brand-border p-5">
          <p className="font-semibold">Coming soon</p>
          <p className="text-[14.5px] text-brand-grey">This life event will use the same workflow engine. For now, message your adviser or start a consultation request.</p>
          <Link to="/client/requests" className="mt-2 inline-block font-semibold text-brand-red hover:underline">Go to requests</Link>
        </div>
      )}

      {outcome && (
        <div className="mt-6 rounded-md border border-brand-border p-5 sm:p-6" role="status">
          <p className="text-[14px] text-ok">Change of address workflow created</p>
          <h2 className="mt-1 text-2xl font-normal">One move, handled in one place</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            <PlanList title="Affected" items={outcome.plan.affected} done />
            <PlanList title="Needed from you" items={outcome.plan.neededFromYou} />
            <PlanList title="Royal Square will" items={outcome.plan.royalSquareWill} />
          </div>
          <div className="mt-6">
            <WorkflowOwner workflow={outcome.workflow} viewerRole="client" compact />
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button as={Link} to="/client/documents">Upload proof of address</Button>
            <Button as={Link} to={`/workflow/${outcome.workflow.id}`} variant="secondary">Track progress</Button>
          </div>
        </div>
      )}
    </>
  );
}
