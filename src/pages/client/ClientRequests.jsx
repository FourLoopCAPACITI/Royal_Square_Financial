import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Section from '../../components/common/Section.jsx';
import Button from '../../components/common/Button.jsx';
import NamedIcon from '../../components/common/NamedIcon.jsx';
import { QueryState, EmptyState } from '../../components/common/States.jsx';
import WorkflowCard from '../../components/workflows/WorkflowCard.jsx';
import { useCurrentClient } from '../../hooks/useCurrentUser.js';
import { useServiceQuery } from '../../hooks/useServiceQuery.js';
import { useLookups } from '../../hooks/useLookups.js';
import { createServiceRequest, listServiceRequests } from '../../services/requestService.js';
import { listWorkflows } from '../../services/workflowService.js';
import { SERVICE_REQUEST_TYPES } from '../../utils/workflowTemplates.js';

function RequestForm({ def, clientId, providers, onCreated, onCancel }) {
  const [providerId, setProviderId] = useState(providers[0]?.id || '');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    const { workflow } = await createServiceRequest({ clientId, type: def.type, providerId: def.askProvider ? providerId : null, details: { note } });
    setBusy(false);
    onCreated(workflow);
  }

  return (
    <form onSubmit={submit} className="mt-4 space-y-4 rounded-md border border-brand-black p-5">
      <p className="font-display text-lg font-medium">{def.label}</p>
      {def.askProvider && (
        <div>
          <label htmlFor="provider" className="field-label">Which provider?</label>
          <select id="provider" className="field" value={providerId} onChange={(e) => setProviderId(e.target.value)}>
            {providers.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      )}
      <div>
        <label htmlFor="note" className="field-label">Anything we should know? <span className="font-normal text-brand-grey">(optional)</span></label>
        <textarea id="note" rows={3} className="field" value={note} onChange={(e) => setNote(e.target.value)} />
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={busy}>{busy ? 'Sending…' : 'Send request'}</Button>
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}

export default function ClientRequests() {
  const client = useCurrentClient();
  const clientId = client.data?.id;
  const { providers, providerName } = useLookups();
  const [selected, setSelected] = useState(null);
  const [created, setCreated] = useState(null);
  const requests = useServiceQuery(() => (clientId ? listServiceRequests({ clientId }) : []), [clientId]);
  const workflows = useServiceQuery(() => (clientId ? listWorkflows({ clientId }) : []), [clientId]);

  const def = SERVICE_REQUEST_TYPES.find((r) => r.type === selected);

  return (
    <>
      <PageHeader title="Requests" description="Ask for a change or a document. Each request is tracked step by step." />

      <Section title="Start a request">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICE_REQUEST_TYPES.map((r) => (
            <button
              key={r.type}
              type="button"
              onClick={() => {
                setSelected(r.type);
                setCreated(null);
              }}
              aria-pressed={selected === r.type}
              className={`flex items-start gap-3 rounded-md border p-4 text-left transition-colors ${selected === r.type ? 'border-brand-red bg-brand-red-tint' : 'border-brand-border hover:border-brand-black'}`}
            >
              <NamedIcon name={r.icon} size={20} className="mt-0.5 shrink-0 text-brand-red" />
              <span>
                <span className="block font-semibold">{r.label}</span>
                <span className="block text-[13.5px] text-brand-grey">{r.description}</span>
              </span>
            </button>
          ))}
        </div>
        {def && !created && clientId && (
          <RequestForm def={def} clientId={clientId} providers={providers} onCreated={setCreated} onCancel={() => setSelected(null)} />
        )}
        {created && (
          <div className="mt-4 flex flex-wrap items-center gap-3 rounded-md bg-ok-tint p-4 text-ok" role="status">
            <CheckCircle2 size={18} aria-hidden="true" />
            <span className="flex-1">Request sent. Royal Square is holding the ball: {created.nextAction.toLowerCase()}.</span>
            <Link to={`/workflow/${created.id}`} className="font-semibold underline">Track it</Link>
          </div>
        )}
      </Section>

      <Section title="Your requests" count={requests.data?.length}>
        <QueryState query={requests}>
          {(list) =>
            list.length ? (
              <div className="grid gap-3 md:grid-cols-2">
                {list.map((r) => {
                  const w = workflows.data?.find((x) => x.id === r.workflowId);
                  return w ? <WorkflowCard key={r.id} workflow={w} providerName={providerName(w.providerId)} viewerRole="client" showOwner={false} /> : null;
                })}
              </div>
            ) : (
              <EmptyState title="No requests yet" message="Choose a request above to get started." />
            )
          }
        </QueryState>
      </Section>
    </>
  );
}
