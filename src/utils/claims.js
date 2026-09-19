/** Accident / claim rules — pure functions. */

export const ACCIDENT_STEPS = [
  { key: 'safety', label: 'Safety' },
  { key: 'location', label: 'Location' },
  { key: 'scene', label: 'Scene photos' },
  { key: 'vehicle', label: 'Vehicle photos' },
  { key: 'otherDriver', label: 'Other driver' },
  { key: 'registration', label: 'Vehicle registration' },
  { key: 'insurance', label: 'Insurance information' },
  { key: 'witnesses', label: 'Witnesses' },
  { key: 'description', label: 'Incident description' },
  { key: 'review', label: 'Review' },
];

export function createEmptyAccidentReport(clientId) {
  return {
    localId: `report_${Date.now().toString(36)}`,
    clientId,
    startedAt: new Date().toISOString(),
    safety: { safe: null, injuries: null, policeNotified: false },
    location: null,
    scenePhotos: [],
    vehiclePhotos: [],
    otherDriver: { name: '', phone: '', idNumber: '' },
    registration: { own: '', other: '' },
    insurance: { otherInsurer: '', otherPolicyNumber: '' },
    witnesses: [],
    description: '',
    voiceNote: null,
  };
}

/** The six-item evidence checklist shown during Accident Assist. */
export function getEvidenceChecklist(report) {
  const items = [
    { key: 'location', label: 'Accident location', done: Boolean(report?.location) },
    { key: 'scene', label: 'Scene photographs', done: (report?.scenePhotos?.length || 0) > 0 },
    { key: 'other_vehicle', label: 'Other vehicle', done: Boolean(report?.registration?.other || report?.otherDriver?.name) },
    { key: 'other_insurer', label: 'Other insurer', done: Boolean(report?.insurance?.otherInsurer) },
    { key: 'witness', label: 'Witness', done: (report?.witnesses?.length || 0) > 0 },
    { key: 'voice', label: 'Voice description', done: Boolean(report?.voiceNote) },
  ];
  return { items, completed: items.filter((i) => i.done).length, total: items.length };
}
