/**
 * Document processing — SIMULATED.
 * Replace extractDocumentData() with a real OCR / document-AI call later
 * (e.g. a Vercel Function or Supabase Edge Function). Keep the return shape.
 */
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/** Returns { fields: {...}, confidence } for the uploaded file. */
export async function extractDocumentData(file, type) {
  await wait(900);
  switch (type) {
    case 'drivers_licence':
      return { fields: { expiryDate: '2027-02-14', licenceCode: 'B', holderMatches: true }, confidence: 0.97 };
    case 'proof_of_address':
      return { fields: { issuedWithinThreeMonths: true, addressMatchesRequest: true }, confidence: 0.91 };
    case 'income_statement':
      return { fields: { period: 'Latest month', employerDetected: true }, confidence: 0.88 };
    default:
      return { fields: {}, confidence: 0.8 };
  }
}
