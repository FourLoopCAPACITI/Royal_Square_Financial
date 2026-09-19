import { FileText } from 'lucide-react';
import StatusBadge from '../common/StatusBadge.jsx';
import { EmptyState } from '../common/States.jsx';
import { getDocumentTypeLabel } from '../../utils/documents.js';
import { daysUntil, formatDate } from '../../utils/format.js';
import { t, tx } from '../../i18n/index.js';
import { useI18n } from '../../i18n/I18nContext.jsx';

const ORDER = { missing: 0, expired: 1, expiring_soon: 2, under_review: 3, current: 4 };

function detail(doc) {
  if (doc.status === 'missing') return t('documents.notUploaded');
  if (doc.expiryDate) {
    const d = daysUntil(doc.expiryDate);
    const date = formatDate(doc.expiryDate);
    if (d < 0) return t('documents.expired', { date });
    return d <= 60 ? t('documents.expiresIn', { date, days: d }) : t('documents.expires', { date });
  }
  return doc.uploadedAt ? t('documents.uploaded', { date: formatDate(doc.uploadedAt) }) : '';
}

export default function DocumentList({ documents = [], clientName }) {
  const { t: tr } = useI18n();
  if (!documents.length) return <EmptyState icon={FileText} title={tr('documents.empty')} message={tr('documents.emptyHint')} />;
  const sorted = [...documents].sort((a, b) => ORDER[a.status] - ORDER[b.status]);
  return (
    <ul className="divide-y divide-brand-border rounded-md border border-brand-border">
      {sorted.map((doc) => (
        <li key={doc.id} className="flex items-center gap-3 p-4">
          <FileText size={18} className="shrink-0 text-brand-grey" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <p className="font-semibold leading-snug">{tx(doc.name)}</p>
            <p className="text-[15px] text-brand-grey">
              {clientName ? `${clientName(doc.clientId)}. ` : ''}
              {getDocumentTypeLabel(doc.type)}. {detail(doc)}
            </p>
          </div>
          <StatusBadge status={doc.status} />
        </li>
      ))}
    </ul>
  );
}
