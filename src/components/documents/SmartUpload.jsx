import { useRef, useState } from 'react';
import { CheckCircle2, Loader2, Upload } from 'lucide-react';
import Button from '../common/Button.jsx';
import { DOCUMENT_TYPES, getDocumentTypeLabel } from '../../utils/documents.js';
import { uploadAndProcessDocument } from '../../services/documentService.js';
import { useI18n } from '../../i18n/I18nContext.jsx';

const STAGE_KEYS = ['upload.stage.uploading', 'upload.stage.reading', 'upload.stage.updating'];

/**
 * Simulated intelligent upload. The real OCR hook-in point is
 * services/documentIntelligence.js → extractDocumentData().
 */
export default function SmartUpload({ clientId, defaultType = 'drivers_licence', onDone }) {
  const { t, tx } = useI18n();
  const [type, setType] = useState(defaultType);
  const [file, setFile] = useState(null);
  const [stage, setStage] = useState(-1);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  async function run() {
    setError('');
    setResult(null);
    setStage(0);
    const timer = setInterval(() => setStage((s) => Math.min(s + 1, STAGE_KEYS.length - 1)), 450);
    try {
      const res = await uploadAndProcessDocument({ clientId, type, file });
      setResult(res.outcome);
      onDone?.(res);
    } catch (err) {
      setError(t('upload.failed'));
    } finally {
      clearInterval(timer);
      setStage(-1);
    }
  }

  const busy = stage >= 0;

  return (
    <div className="rounded-md border border-brand-border p-5">
      <h2 className="text-lg font-medium">{t('upload.title')}</h2>
      <p className="mb-4 text-[14px] text-brand-grey">{t('upload.description')}</p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="doc-type" className="field-label">{t('upload.type')}</label>
          <select id="doc-type" className="field" value={type} onChange={(e) => setType(e.target.value)} disabled={busy}>
            {DOCUMENT_TYPES.map((d) => (
              <option key={d.type} value={d.type}>{getDocumentTypeLabel(d.type)}</option>
            ))}
          </select>
        </div>
        <div>
          <span className="field-label">{t('upload.file')}</span>
          <input ref={inputRef} type="file" accept="image/*,application/pdf" className="sr-only" id="doc-file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          <label htmlFor="doc-file" className="field flex cursor-pointer items-center gap-2 truncate text-brand-grey hover:border-brand-black">
            <Upload size={16} aria-hidden="true" />
            <span className="truncate">{file ? file.name : t('upload.choose')}</span>
          </label>
        </div>
      </div>

      <Button className="mt-4" onClick={run} disabled={busy} icon={busy ? undefined : Upload}>
        {busy ? (
          <>
            <Loader2 size={18} className="animate-spin" aria-hidden="true" /> {t(STAGE_KEYS[stage])}…
          </>
        ) : (
          t('upload.submit')
        )}
      </Button>
      {error && <p className="mt-3 text-[14px] text-brand-red" role="alert">{error}</p>}

      {result && (
        <div className="mt-5 rounded-md bg-brand-light-grey p-4" role="status">
          <p className="font-semibold">{tx(result.headline)}</p>
          <p className="text-[14px] text-brand-grey">{t('upload.processed')}</p>
          {result.detected.map((d) => (
            <p key={d.label} className="mt-3 text-[14px]">
              {tx(d.label)}
              <span className="block font-display text-[20px] font-normal">{d.value}</span>
            </p>
          ))}
          <ul className="mt-3 space-y-1.5">
            {result.actions.map((a) => (
              <li key={a} className="flex items-center gap-2 text-[14.5px] text-ok">
                <CheckCircle2 size={16} aria-hidden="true" /> {tx(a)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
