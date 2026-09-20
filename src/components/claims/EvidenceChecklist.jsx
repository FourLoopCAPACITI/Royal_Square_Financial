import { Check, Circle } from 'lucide-react';
import { getEvidenceChecklist } from '../../utils/claims.js';
import { useI18n } from '../../i18n/I18nContext.jsx';

export default function EvidenceChecklist({ report }) {
  const { t, tx } = useI18n();
  const { items, completed, total } = getEvidenceChecklist(report);
  return (
    <div className="rounded-lg border border-brand-border bg-surface shadow-card p-4">
      <div className="mb-3 flex items-baseline justify-between">
        <p className="font-semibold">{t('evidence.title')}</p>
        <p className="font-display text-lg tabular-nums">
          {completed} / {total}
          <span className="sr-only"> {t('evidence.complete')}</span>
        </p>
      </div>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li key={item.key} className={`flex items-center gap-2 text-[16px] ${item.done ? '' : 'text-brand-grey'}`}>
            {item.done ? <Check size={16} className="text-ok" aria-hidden="true" /> : <Circle size={14} aria-hidden="true" />}
            {tx(item.label)}
            <span className="sr-only"> {item.done ? t('evidence.captured') : t('evidence.notCaptured')}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[14px] text-brand-grey">{t('evidence.hint')}</p>
    </div>
  );
}
