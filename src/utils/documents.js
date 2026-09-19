/** Document rules — pure functions. */
import { daysUntil } from './format.js';
import { t } from '../i18n/index.js';

export const DOCUMENT_TYPES = [
  { type: 'id_document', label: 'ID document', expires: false },
  { type: 'drivers_licence', label: "Driver's licence", expires: true },
  { type: 'policy_schedule', label: 'Policy schedule', expires: false },
  { type: 'valuation_certificate', label: 'Valuation certificate', expires: true },
  { type: 'proof_of_address', label: 'Proof of address', expires: true },
  { type: 'investment_statement', label: 'Investment statement', expires: false },
  { type: 'income_statement', label: 'Income statement', expires: false },
  { type: 'other', label: 'Other', expires: false },
];

export const DOCUMENT_STATUS = {
  current: 'current',
  missing: 'missing',
  expiring_soon: 'expiring_soon',
  expired: 'expired',
  under_review: 'under_review',
};

export const EXPIRY_WARNING_DAYS = 60;

export function getDocumentTypeLabel(type) {
  return DOCUMENT_TYPES.some((d) => d.type === type) ? t(`docType.${type}`) : t('docType.generic');
}

/** Expiry-based status wins over the stored "current" status. */
export function computeDocumentStatus(doc, now = new Date()) {
  if (!doc) return DOCUMENT_STATUS.missing;
  if (doc.status === DOCUMENT_STATUS.missing || doc.status === DOCUMENT_STATUS.under_review) return doc.status;
  if (doc.expiryDate) {
    const days = daysUntil(doc.expiryDate, now);
    if (days < 0) return DOCUMENT_STATUS.expired;
    if (days <= EXPIRY_WARNING_DAYS) return DOCUMENT_STATUS.expiring_soon;
  }
  return DOCUMENT_STATUS.current;
}
