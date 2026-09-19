/**
 * The ten Accident Assist steps. Each receives { report, update } and
 * writes into its own slice of the report. Keep steps small and independent.
 */
import { useState } from 'react';
import { Loader2, MapPin, Mic, Phone, Plus, Square, Trash2 } from 'lucide-react';
import Button from '../../common/Button.jsx';
import PhotoCapture from './PhotoCapture.jsx';
import { getCurrentPosition, startVoiceRecording, stopVoiceRecording } from '../../../services/deviceService.js';

function Choice({ label, selected, onClick }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={selected} className={`rounded border px-4 py-3 text-left font-semibold ${selected ? 'border-brand-red bg-brand-red-tint text-brand-red' : 'border-brand-border hover:border-brand-black'}`}>
      {label}
    </button>
  );
}

function Field({ id, label, optional, ...props }) {
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label} {optional && <span className="font-normal text-brand-grey">(optional)</span>}
      </label>
      <input id={id} className="field" {...props} />
    </div>
  );
}

export function SafetyStep({ report, update }) {
  const s = report.safety;
  return (
    <div className="space-y-5">
      <p className="text-[17px]">First, is everyone safe?</p>
      <div className="grid gap-2 sm:grid-cols-2">
        <Choice label="Yes, everyone is safe" selected={s.injuries === false} onClick={() => update('safety', { ...s, injuries: false, safe: true })} />
        <Choice label="Someone is hurt" selected={s.injuries === true} onClick={() => update('safety', { ...s, injuries: true })} />
      </div>
      {s.injuries === true && (
        <div className="rounded-md bg-brand-red p-4 text-white" role="alert">
          <p className="font-semibold">Call for help now</p>
          <p className="text-[16px]">Emergency from a mobile: 112. SAPS: 10111. Continue here only once help is on the way.</p>
          <a href="tel:112" className="mt-3 inline-flex items-center gap-2 rounded bg-white px-4 py-2 font-semibold text-brand-red">
            <Phone size={16} aria-hidden="true" /> Call 112
          </a>
        </div>
      )}
      <ul className="list-disc space-y-1 pl-5 text-[16px] text-[#3A3A3A]">
        <li>Switch on your hazard lights and move out of traffic if you can.</li>
        <li>Don't admit fault or sign anything at the scene.</li>
        <li>You may need to report the accident at a police station within 24 hours.</li>
      </ul>
      <label className="flex items-center gap-2 text-[16.5px]">
        <input type="checkbox" className="h-4 w-4 accent-[#9A1C20]" checked={s.policeNotified} onChange={(e) => update('safety', { ...s, policeNotified: e.target.checked })} />
        Police have been notified
      </label>
    </div>
  );
}

export function LocationStep({ report, update }) {
  const [busy, setBusy] = useState(false);
  async function locate() {
    setBusy(true);
    update('location', await getCurrentPosition());
    setBusy(false);
  }
  return (
    <div className="space-y-4">
      <Button onClick={locate} disabled={busy} size="lg" icon={busy ? undefined : MapPin}>
        {busy ? <><Loader2 size={18} className="animate-spin" aria-hidden="true" /> Finding you…</> : 'Use my current location'}
      </Button>
      <p className="text-[14px] text-brand-grey">GPS is simulated in the web prototype.</p>
      <div>
        <label htmlFor="address" className="field-label">Or describe where it happened</label>
        <input
          id="address"
          className="field"
          value={report.location?.address || ''}
          onChange={(e) => update('location', e.target.value ? { ...(report.location || {}), address: e.target.value } : null)}
          placeholder="e.g. Corner of Main Road and Belmont Road, Rondebosch"
        />
      </div>
      {report.location?.lat && (
        <p className="text-[15.5px] text-brand-grey">
          Captured at {report.location.lat.toFixed(4)}, {report.location.lng.toFixed(4)} (accurate to about {report.location.accuracyMetres} m)
        </p>
      )}
    </div>
  );
}

export function SceneStep({ report, update }) {
  return (
    <PhotoCapture
      kind="scene"
      photos={report.scenePhotos}
      onChange={(p) => update('scenePhotos', p)}
      tips={['Take wide shots showing both vehicles and the road.', 'Include traffic lights, road signs and skid marks.', 'Photograph from several angles.']}
    />
  );
}

export function VehicleStep({ report, update }) {
  return (
    <PhotoCapture
      kind="vehicle"
      photos={report.vehiclePhotos}
      onChange={(p) => update('vehiclePhotos', p)}
      tips={['Close-ups of all damage to your vehicle.', "The other vehicle's damage and number plate.", 'Your odometer, if it is safe to do so.']}
    />
  );
}

export function OtherDriverStep({ report, update }) {
  const d = report.otherDriver;
  const set = (key) => (e) => update('otherDriver', { ...d, [key]: e.target.value });
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field id="od-name" label="Full name" value={d.name} onChange={set('name')} autoComplete="off" />
      <Field id="od-phone" label="Phone number" type="tel" value={d.phone} onChange={set('phone')} autoComplete="off" />
      <Field id="od-id" label="ID number" optional value={d.idNumber} onChange={set('idNumber')} autoComplete="off" />
    </div>
  );
}

export function RegistrationStep({ report, update, defaultOwnRegistration }) {
  const r = report.registration;
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field id="own-reg" label="Your vehicle" value={r.own || defaultOwnRegistration || ''} onChange={(e) => update('registration', { ...r, own: e.target.value })} />
      <Field id="other-reg" label="Other vehicle registration" value={r.other} onChange={(e) => update('registration', { ...r, other: e.target.value.toUpperCase() })} placeholder="e.g. CA 987-654" />
    </div>
  );
}

export function InsuranceStep({ report, update }) {
  const i = report.insurance;
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field id="other-insurer" label="Other driver's insurer" value={i.otherInsurer} onChange={(e) => update('insurance', { ...i, otherInsurer: e.target.value })} placeholder="If they know it" />
      <Field id="other-policy" label="Their policy number" optional value={i.otherPolicyNumber} onChange={(e) => update('insurance', { ...i, otherPolicyNumber: e.target.value })} />
    </div>
  );
}

export function WitnessesStep({ report, update }) {
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
        <Field id="w-name" label="Witness name" value={name} onChange={(e) => setName(e.target.value)} />
        <Field id="w-phone" label="Phone number" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <Button variant="secondary" onClick={add} icon={Plus}>Add</Button>
      </div>
      {report.witnesses.length > 0 ? (
        <ul className="divide-y divide-brand-border rounded-md border border-brand-border">
          {report.witnesses.map((w, i) => (
            <li key={`${w.name}-${i}`} className="flex items-center justify-between p-3">
              <span><span className="font-semibold">{w.name}</span> <span className="text-brand-grey">{w.phone}</span></span>
              <button type="button" onClick={() => update('witnesses', report.witnesses.filter((_, j) => j !== i))} className="rounded p-1 text-brand-grey hover:text-brand-red" aria-label={`Remove ${w.name}`}>
                <Trash2 size={16} />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-[15.5px] text-brand-grey">No witnesses added. Skip this step if nobody saw it.</p>
      )}
    </div>
  );
}

export function DescriptionStep({ report, update }) {
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
        <label htmlFor="desc" className="field-label">What happened?</label>
        <textarea id="desc" rows={5} className="field" value={report.description} onChange={(e) => update('description', e.target.value)} placeholder="Where were you going, what did the other vehicle do, what was damaged?" />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button variant={recording ? 'dark' : 'secondary'} onClick={toggle} icon={recording ? Square : Mic}>
          {recording ? 'Stop recording' : report.voiceNote ? 'Record again' : 'Record a voice description'}
        </Button>
        {recording && <span className="flex items-center gap-2 text-[15.5px] text-brand-red"><span className="rsf-ball h-2.5 w-2.5 rounded-full bg-brand-red" aria-hidden="true" />Recording</span>}
        {!recording && report.voiceNote && <span className="text-[15.5px] text-ok">Voice note saved ({report.voiceNote.durationSeconds}s)</span>}
      </div>
      <p className="text-[14px] text-brand-grey">Voice recording is simulated in the web prototype.</p>
    </div>
  );
}

export function ReviewStep({ report, goTo }) {
  const rows = [
    ['Safety', report.safety.injuries === true ? 'Someone was hurt' : report.safety.injuries === false ? 'Everyone safe' : 'Not answered', 0],
    ['Location', report.location?.address || 'Not captured', 1],
    ['Scene photos', `${report.scenePhotos.length} photo(s)`, 2],
    ['Vehicle photos', `${report.vehiclePhotos.length} photo(s)`, 3],
    ['Other driver', report.otherDriver.name || 'Not captured', 4],
    ['Other vehicle', report.registration.other || 'Not captured', 5],
    ['Other insurer', report.insurance.otherInsurer || 'Not captured', 6],
    ['Witnesses', report.witnesses.length ? report.witnesses.map((w) => w.name).join(', ') : 'None', 7],
    ['Description', report.description || (report.voiceNote ? 'Voice note only' : 'Not captured'), 8],
  ];
  return (
    <dl className="divide-y divide-brand-border rounded-md border border-brand-border">
      {rows.map(([label, value, index]) => (
        <div key={label} className="grid grid-cols-[120px_1fr_auto] items-start gap-3 p-3 text-[16px] sm:grid-cols-[160px_1fr_auto]">
          <dt className="text-brand-grey">{label}</dt>
          <dd className="min-w-0 break-words">{value}</dd>
          <button type="button" onClick={() => goTo(index)} className="text-[15px] font-semibold text-brand-red hover:underline">Edit</button>
        </div>
      ))}
    </dl>
  );
}
