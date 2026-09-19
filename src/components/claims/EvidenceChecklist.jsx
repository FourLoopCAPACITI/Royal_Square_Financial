import { Check, Circle } from 'lucide-react';
import { getEvidenceChecklist } from '../../utils/claims.js';

export default function EvidenceChecklist({ report }) {
  const { items, completed, total } = getEvidenceChecklist(report);
  return (
    <div className="rounded-md border border-brand-border p-4">
      <div className="mb-3 flex items-baseline justify-between">
        <p className="font-semibold">Evidence</p>
        <p className="font-display text-lg tabular-nums">
          {completed} / {total}
          <span className="sr-only"> complete</span>
        </p>
      </div>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li key={item.key} className={`flex items-center gap-2 text-[14.5px] ${item.done ? '' : 'text-brand-grey'}`}>
            {item.done ? <Check size={16} className="text-ok" aria-hidden="true" /> : <Circle size={14} aria-hidden="true" />}
            {item.label}
            <span className="sr-only">{item.done ? ' captured' : ' not captured'}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[12.5px] text-brand-grey">Capture what you safely can. Your adviser can follow up on the rest.</p>
    </div>
  );
}
