import { useRef, useState } from 'react';
import { CheckCircle2, Loader2, Upload } from 'lucide-react';
import Button from '../common/Button.jsx';
import { DOCUMENT_TYPES } from '../../utils/documents.js';
import { uploadAndProcessDocument } from '../../services/documentService.js';

const STAGES = ['Uploading', 'Reading the document', 'Updating your records'];

/**
 * Simulated intelligent upload. The real OCR hook-in point is
 * services/documentIntelligence.js → extractDocumentData().
 */
export default function SmartUpload({ clientId, defaultType = 'drivers_licence', onDone }) {
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
    const timer = setInterval(() => setStage((s) => Math.min(s + 1, STAGES.length - 1)), 450);
    try {
      const res = await uploadAndProcessDocument({ clientId, type, file });
      setResult(res.outcome);
      onDone?.(res);
    } catch (err) {
      setError(err.message || 'Upload failed. Try again.');
    } finally {
      clearInterval(timer);
      setStage(-1);
    }
  }

  const busy = stage >= 0;

  return (
    <div className="rounded-md border border-brand-border p-5">
      <h2 className="text-lg font-medium">Upload document</h2>
      <p className="mb-4 text-[14px] text-brand-grey">We read the document, file it and update anything that depends on it.</p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="doc-type" className="field-label">Document type</label>
          <select id="doc-type" className="field" value={type} onChange={(e) => setType(e.target.value)} disabled={busy}>
            {DOCUMENT_TYPES.map((t) => (
              <option key={t.type} value={t.type}>{t.label}</option>
            ))}
          </select>
        </div>
        <div>
          <span className="field-label">File</span>
          <input ref={inputRef} type="file" accept="image/*,application/pdf" className="sr-only" id="doc-file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          <label htmlFor="doc-file" className="field flex cursor-pointer items-center gap-2 truncate text-brand-grey hover:border-brand-black">
            <Upload size={16} aria-hidden="true" />
            <span className="truncate">{file ? file.name : 'Choose a file (optional in demo)'}</span>
          </label>
        </div>
      </div>

      <Button className="mt-4" onClick={run} disabled={busy} icon={busy ? undefined : Upload}>
        {busy ? (
          <>
            <Loader2 size={18} className="animate-spin" aria-hidden="true" /> {STAGES[stage]}…
          </>
        ) : (
          'Upload and process'
        )}
      </Button>
      {error && <p className="mt-3 text-[14px] text-brand-red" role="alert">{error}</p>}

      {result && (
        <div className="mt-5 rounded-md bg-brand-light-grey p-4" role="status">
          <p className="font-semibold">{result.headline}</p>
          <p className="text-[14px] text-brand-grey">Document processed</p>
          {result.detected.map((d) => (
            <p key={d.label} className="mt-3 text-[14px]">
              {d.label}
              <span className="block font-display text-[20px] font-normal">{d.value}</span>
            </p>
          ))}
          <ul className="mt-3 space-y-1.5">
            {result.actions.map((a) => (
              <li key={a} className="flex items-center gap-2 text-[14.5px] text-ok">
                <CheckCircle2 size={16} aria-hidden="true" /> {a}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
