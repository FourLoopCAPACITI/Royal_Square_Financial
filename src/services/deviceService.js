/**
 * Device capabilities used by Accident Assist — SIMULATED for the web prototype.
 *
 * Capacitor migration: replace each function body with the native plugin call.
 *   capturePhoto        → @capacitor/camera        Camera.getPhoto()
 *   getCurrentPosition  → @capacitor/geolocation   Geolocation.getCurrentPosition()
 *   voice recording     → a Capacitor voice recorder plugin
 * Keep the return shapes the same and no UI code needs to change.
 */
import { uid } from '../utils/format.js';

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

export async function capturePhoto(kind = 'scene') {
  await wait(350);
  return {
    id: uid('photo'),
    kind,
    name: `${kind}-photo-${new Date().toLocaleTimeString('en-ZA', { hour12: false })}.jpg`,
    capturedAt: new Date().toISOString(),
    simulated: true,
  };
}

export async function getCurrentPosition() {
  await wait(600);
  return {
    lat: -33.9611,
    lng: 18.4721,
    accuracyMetres: 12,
    address: 'Main Road & Belmont Road, Rondebosch, Cape Town',
    capturedAt: new Date().toISOString(),
    simulated: true,
  };
}

let recordingStartedAt = null;

export async function startVoiceRecording() {
  recordingStartedAt = Date.now();
  return { recording: true };
}

export async function stopVoiceRecording() {
  const seconds = recordingStartedAt ? Math.max(1, Math.round((Date.now() - recordingStartedAt) / 1000)) : 1;
  recordingStartedAt = null;
  return { id: uid('voice'), durationSeconds: seconds, capturedAt: new Date().toISOString(), simulated: true };
}
