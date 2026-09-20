/**
 * The ten Accident Assist steps. Each receives { report, update } and
 * writes into its own slice of the report. Keep steps small and independent.
 */
import { useState } from 'react';
import { Loader2, MapPin, Mic, Phone, Plus, Square, Trash2 } from 'lucide-react';
import Button from '../../common/Button.jsx';
import PhotoCapture from './PhotoCapture.jsx';
import { getCurrentPosition, startVoiceRecording, stopVoiceRecording } from '../../../services/deviceService.js';
import { useI18n } from '../../../i18n/I18nContext.jsx';

function Choice({ label, selected, onClick }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={selected} className={`rounded border px-4 py-3 text-left font-semibold ${selected ? 'border-brand-red bg-brand-red-tint text-brand-red' : 'border-brand-border hover:border-brand-black'}`}>
      {label}
    </button>
  );
}

function Field({ id, label, optional, ...props }) {
  const { t } = useI18n();
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label} {optional && <span className="font-normal text-brand-grey">{t('common.optional')}</span>}
      </label>
      <input id={id} className="field" {...props} />
    </div>
  );
}

export function SafetyStep({ report, update }) {
  const { t } = useI18n();
  const s = report.safety;
  return (
    <div className="space-y-5">
      <p className="text-[17px]">{t('accident.safe.question')}</p>
      <div className="grid gap-2 sm:grid-cols-2">
        <Choice label={t('accident.safe.yes')} selected={s.injuries === false} onClick={() => update('safety', { ...s, injuries: false, safe: true })} />
        <Choice label={t('accident.safe.hurt')} selected={s.injuries === true} onClick={() => update('safety', { ...s, injuries: true })} />
      </div>
      {s.injuries === true && (
        <div className="rounded-md bg-danger p-4 text-white" role="alert">
          <p className="font-semibold">{t('accident.safe.callTitle')}</p>
          <p className="text-[16px]">{t('accident.safe.callText')}</p>
          <a href="tel:112" className="mt-3 inline-flex items-center gap-2 rounded bg-surface px-4 py-2 font-semibold text-danger">
            <Phone size={16} aria-hidden="true" /> {t('accident.safe.call112')}
          </a>
        </div>
      )}
      <ul className="list-disc space-y-1 pl-5 text-[16px] text-text-secondary">
        <li>{t('accident.safe.tip1')}</li>
        <li>{t('accident.safe.tip2')}</li>
        <li>{t('accident.safe.tip3')}</li>
      </ul>
      <label className="flex items-center gap-2 text-[16.5px]">
        <input type="checkbox" className="h-4 w-4 accent-[#0F2747]" checked={s.policeNotified} onChange={(e) => update('safety', { ...s, policeNotified: e.target.checked })} />
        {t('accident.safe.police')}
      </label>
    </div>
  );
}

export function LocationStep({ report, update }) {
  const { t } = useI18n();
  const [busy, setBusy] = useState(false);
  async function locate() {
    setBusy(true);
    update('location', await getCurrentPosition());
    setBusy(false);
  }
  return (
    <div className="space-y-4">
      <Button onClick={locate} disabled={busy} size="lg" icon={busy ? undefined : MapPin}>
        {busy ? <><Loader2 size={18} className="animate-spin" aria-hidden="true" /> {t('accident.location.finding')}</> : t('accident.location.use')}
      </Button>
      <p className="text-[14px] text-brand-grey">{t('accident.location.simulated')}</p>
      <div>
        <label htmlFor="address" className="field-label">{t('accident.location.describe')}</label>
        <input
          id="address"
          className="field"
          value={report.location?.address || ''}
          onChange={(e) => update('location', e.target.value ? { ...(report.location || {}), address: e.target.value } : null)}
          placeholder={t('accident.location.placeholder')}
        />
      </div>
      {report.location?.lat && (
        <p className="text-[15.5px] text-brand-grey">
          {t('accident.location.captured', { lat: report.location.lat.toFixed(4), lng: report.location.lng.toFixed(4), accuracy: report.location.accuracyMetres })}
        </p>
      )}
    </div>
  );
}

export function SceneStep({ report, update }) {
  const { t } = useI18n();
  return (
    <PhotoCapture
      kind="scene"
      photos={report.scenePhotos}
      onChange={(p) => update('scenePhotos', p)}
      tips={[t('accident.scene.tip1'), t('accident.scene.tip2'), t('accident.scene.tip3')]}
    />
  );
}

export function VehicleStep({ report, update }) {
  const { t } = useI18n();
  return (
    <PhotoCapture
      kind="vehicle"
      photos={report.vehiclePhotos}
      onChange={(p) => update('vehiclePhotos', p)}
      tips={[t('accident.vehicle.tip1'), t('accident.vehicle.tip2'), t('accident.vehicle.tip3')]}
    />
  );
}

export function OtherDriverStep({ report, update }) {
  const { t } = useI18n();
  const d = report.otherDriver;
  const set = (key) => (e) => update('otherDriver', { ...d, [key]: e.target.value });
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field id="od-name" label={t('accident.driver.name')} value={d.name} onChange={set('name')} autoComplete="off" />
      <Field id="od-phone" label={t('accident.driver.phone')} type="tel" value={d.phone} onChange={set('phone')} autoComplete="off" />
      <Field id="od-id" label={t('accident.driver.id')} optional value={d.idNumber} onChange={set('idNumber')} autoComplete="off" />
    </div>
  );
}

export function RegistrationStep({ report, update, defaultOwnRegistration }) {
  const { t } = useI18n();
  const r = report.registration;
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field id="own-reg" label={t('accident.reg.own')} value={r.own || defaultOwnRegistration || ''} onChange={(e) => update('registration', { ...r, own: e.target.value })} />
      <Field id="other-reg" label={t('accident.reg.other')} value={r.other} onChange={(e) => update('registration', { ...r, other: e.target.value.toUpperCase() })} placeholder={t('accident.reg.placeholder')} />
    </div>
  );
}

export function InsuranceStep({ report, update }) {
  const { t } = useI18n();
  const i = report.insurance;
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field id="other-insurer" label={t('accident.ins.other')} value={i.otherInsurer} onChange={(e) => update('insurance', { ...i, otherInsurer: e.target.value })} placeholder={t('accident.ins.placeholder')} />
      <Field id="other-policy" label={t('accident.ins.policy')} optional value={i.otherPolicyNumber} onChange={(e) => update('insurance', { ...i, otherPolicyNumber: e.target.value })} />
    </div>
  );
}

export function WitnessesStep({ report, update }) {
  const { t } = useI18n();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const add = () => {
    if (!name.trim()) return;
    update('witnesses', [...report.witnesses, { name: name.trim(), phone: phone.trim() }]);
    setName('');
    setPhone('');
  };
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <Field id="w-name" label={t('accident.witness.name')} value={name} onChange={(e) => setName(e.target.value)} />
        <Field id="w-phone" label={t('accident.driver.phone')} type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <Button variant="secondary" onClick={add} icon={Plus}>{t('accident.witness.add')}</Button>
      </div>
      {report.witnesses.length > 0 ? (
        <ul className="divide-y divide-brand-border rounded-lg border border-brand-border bg-surface shadow-card">
          {report.witnesses.map((w, i) => (
            <li key={`${w.name}-${i}`} className="flex items-center justify-between p-3">
              <span><span className="font-semibold">{w.name}</span> <span className="text-brand-grey">{w.phone}</span></span>
              <button type="button" onClick={() => update('witnesses', report.witnesses.filter((_, j) => j !== i))} className="rounded p-1 text-brand-grey hover:text-brand-red" aria-label={t('accident.witness.remove', { name: w.name })}>
                <Trash2 size={16} />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-[15.5px] text-brand-grey">{t('accident.witness.none')}</p>
      )}
    </div>
  );
}

export function DescriptionStep({ report, update }) {
  const { t } = useI18n();
  const [recording, setRecording] = useState(false);
  async function toggle() {
    if (recording) {
      update('voiceNote', await stopVoiceRecording());
      setRecording(false);
    } else {
      await startVoiceRecording();
      setRecording(true);
    }
  }
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="desc" className="field-label">{t('accident.desc.label')}</label>
        <textarea id="desc" rows={5} className="field" value={report.description} onChange={(e) => update('description', e.target.value)} placeholder={t('accident.desc.placeholder')} />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button variant={recording ? 'dark' : 'secondary'} onClick={toggle} icon={recording ? Square : Mic}>
          {recording ? t('accident.desc.stop') : report.voiceNote ? t('accident.desc.again') : t('accident.desc.record')}
        </Button>
        {recording && <span className="flex items-center gap-2 text-[15.5px] text-danger"><span className="rsf-ball h-2.5 w-2.5 rounded-full bg-danger" aria-hidden="true" />{t('accident.desc.recording')}</span>}
        {!recording && report.voiceNote && <span className="text-[15.5px] text-ok">{t('accident.desc.saved', { seconds: report.voiceNote.durationSeconds })}</span>}
      </div>
      <p className="text-[14px] text-brand-grey">{t('accident.desc.simulated')}</p>
    </div>
  );
}

export function ReviewStep({ report, goTo }) {
  const { t } = useI18n();
  const notCaptured = t('accident.review.notCaptured');
  const rows = [
    [t('accident.review.safety'), report.safety.injuries === true ? t('accident.review.hurt') : report.safety.injuries === false ? t('accident.review.safe') : t('accident.review.notAnswered'), 0],
    [t('accident.review.location'), report.location?.address || notCaptured, 1],
    [t('accident.review.scene'), t('accident.review.photos', { count: report.scenePhotos.length }), 2],
    [t('accident.review.vehicle'), t('accident.review.photos', { count: report.vehiclePhotos.length }), 3],
    [t('accident.review.driver'), report.otherDriver.name || notCaptured, 4],
    [t('accident.review.otherVehicle'), report.registration.other || notCaptured, 5],
    [t('accident.review.insurer'), report.insurance.otherInsurer || notCaptured, 6],
    [t('accident.review.witnesses'), report.witnesses.length ? report.witnesses.map((w) => w.name).join(', ') : t('accident.review.none'), 7],
    [t('accident.review.description'), report.description || (report.voiceNote ? t('accident.review.voiceOnly') : notCaptured), 8],
  ];
  return (
    <dl className="divide-y divide-brand-border rounded-lg border border-brand-border bg-surface shadow-card">
      {rows.map(([label, value, index]) => (
        <div key={label} className="grid grid-cols-[120px_1fr_auto] items-start gap-3 p-3 text-[16px] sm:grid-cols-[160px_1fr_auto]">
          <dt className="text-brand-grey">{label}</dt>
          <dd className="min-w-0 break-words">{value}</dd>
          <button type="button" onClick={() => goTo(index)} className="text-[15px] font-semibold text-brand-red hover:underline">{t('accident.review.edit')}</button>
        </div>
      ))}
    </dl>
  );
}
