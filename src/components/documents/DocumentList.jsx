import { FileText } from 'lucide-react';
import StatusBadge from '../common/StatusBadge.jsx';
import { EmptyState } from '../common/States.jsx';
import { getDocumentTypeLabel } from '../../utils/documents.js';
import { daysUntil, formatDate } from '../../utils/format.js';

const ORDER = { missing: 0, expired: 1, expiring_soon: 2, under_review: 3, current: 4 };

function detail(doc) {
  if (doc.status === 'missing') return 'Not uploaded yet';
  if (doc.expiryDate) {
    const d = daysUntil(doc.expiryDate);
    if (d < 0) return `Expired ${formatDate(doc.expiryDate)}`;
    return `Expires ${formatDate(doc.expiryDate)}${d <= 60 ? ` (in ${d} days)` : ''}`;
  }
  return doc.uploadedAt ? `Uploaded ${formatDate(doc.uploadedAt)}` : '';
}

export default function DocumentList({ documents = [], clientName }) {
  if (!documents.length) return <EmptyState icon={FileText} title="No documents yet" message="Upload a document and we'll file it and track any expiry dates." />;
  const sorted = [...documents].sort((a, b) => ORDER[a.status] - ORDER[b.status]);
  return (
    <ul className="divide-y divide-brand-border rounded-md border border-brand-border">
      {sorted.map((doc) => (
        <li key={doc.id} className="flex items-center gap-3 p-4">
          <FileText size={18} className="shrink-0 text-brand-grey" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <p className="font-semibold leading-snug">{doc.name}</p>
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
