import { Check, Circle } from 'lucide-react';
import { formatDate, formatTime } from '../../utils/format.js';

export default function ClaimDetails({ claim }) {
  if (!claim) return null;
  const captured = claim.evidence?.filter((e) => e.captured).length || 0;
  return (
    <div className="rounded-md border border-brand-border p-5">
      <h2 className="mb-3 text-lg font-medium">Claim details</h2>
      <dl className="grid gap-x-6 gap-y-3 text-[14.5px] sm:grid-cols-2">
        <div>
          <dt className="text-brand-grey">Claim number</dt>
          <dd className="font-semibold tabular-nums">{claim.claimNumber || 'Waiting for insurer'}</dd>
        </div>
        <div>
          <dt className="text-brand-grey">Incident</dt>
          <dd className="font-medium">{formatDate(claim.incidentAt)}, {formatTime(claim.incidentAt)}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-brand-grey">Location</dt>
          <dd className="font-medium">{claim.location}</dd>
        </div>
        {claim.vehicle && (
          <div>
            <dt className="text-brand-grey">Vehicle</dt>
            <dd className="font-medium">{claim.vehicle}</dd>
          </div>
        )}
        {claim.otherParty?.registration && (
          <div>
            <dt className="text-brand-grey">Other vehicle</dt>
            <dd className="font-medium">{claim.otherParty.registration}{claim.otherParty.name ? `, ${claim.otherParty.name}` : ''}</dd>
          </div>
        )}
        <div className="sm:col-span-2">
          <dt className="text-brand-grey">What happened</dt>
          <dd>{claim.description}</dd>
        </div>
      </dl>
      {claim.evidence?.length > 0 && (
        <div className="mt-4 border-t border-brand-border pt-4">
          <p className="mb-2 text-[14px] font-semibold">Evidence {captured} / {claim.evidence.length}</p>
          <ul className="grid gap-1.5 sm:grid-cols-2">
            {claim.evidence.map((e) => (
              <li key={e.id} className={`flex items-center gap-2 text-[14px] ${e.captured ? '' : 'text-brand-grey'}`}>
                {e.captured ? <Check size={15} className="text-ok" aria-hidden="true" /> : <Circle size={13} aria-hidden="true" />}
                {e.label}
              </li>
            ))}
          </ul>
        </div>
      )}
      {claim.capturedOffline && <p className="mt-3 text-[13px] text-brand-grey">Captured offline and synced when the phone reconnected.</p>}
    </div>
  );
}
