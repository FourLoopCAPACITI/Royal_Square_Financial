import { useState } from 'react';
import { Camera, ImageIcon, Loader2, X } from 'lucide-react';
import Button from '../../common/Button.jsx';
import { capturePhoto } from '../../../services/deviceService.js';
import { useI18n } from '../../../i18n/I18nContext.jsx';

/** Simulated camera. Swap deviceService.capturePhoto for @capacitor/camera later. */
export default function PhotoCapture({ kind, photos, onChange, tips }) {
  const { t } = useI18n();
  const [busy, setBusy] = useState(false);
  async function take() {
    setBusy(true);
    const photo = await capturePhoto(kind);
    onChange([...photos, photo]);
    setBusy(false);
  }
  return (
    <div>
      <ul className="mb-4 list-disc space-y-1 pl-5 text-[14.5px] text-[#3A3A3A]">
        {tips.map((t) => <li key={t}>{t}</li>)}
      </ul>
      <Button onClick={take} disabled={busy} icon={busy ? undefined : Camera} size="lg">
        {busy ? <><Loader2 size={18} className="animate-spin" aria-hidden="true" /> {t('accident.photo.opening')}</> : t('accident.photo.take')}
      </Button>
      <p className="mt-2 text-[12.5px] text-brand-grey">{t('accident.photo.simulated')}</p>
      {photos.length > 0 && (
        <ul className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {photos.map((p, i) => (
            <li key={p.id} className="relative flex aspect-square flex-col items-center justify-center rounded border border-brand-border bg-brand-light-grey text-brand-grey">
              <ImageIcon size={22} aria-hidden="true" />
              <span className="mt-1 text-[11.5px]">{t('accident.photo.n', { n: i + 1 })}</span>
              <button type="button" onClick={() => onChange(photos.filter((x) => x.id !== p.id))} className="absolute right-1 top-1 rounded bg-white p-0.5 hover:text-brand-red" aria-label={t('accident.photo.remove', { n: i + 1 })}>
                <X size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
