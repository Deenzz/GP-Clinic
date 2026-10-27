import { ClinicalTemplate, ClinicProfile, QuickVitals } from '../types/clinical';

export function formatSoapNote(template: ClinicalTemplate): string {
  const d = template.data;
  return `UNDERLYING DISEASE / ALLERGIES:
${d.underlying}

PRESENTED WITH (P/W):
${d.pw}

VITAL SIGNS:
${d.vitals}

PER EXAMINATION (O/E):
${d.oe}

IMPRESSION / DIAGNOSIS (IMP/DX):
${d.imp}

SUGGESTED PLAN:
${d.plan}`;
}

export function formatReferralLetter(template: ClinicalTemplate, profile: ClinicProfile): string {
  if (!template.data.referralLetter) {
    return '';
  }
  const today = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return template.data.referralLetter
    .replace(/\[DATE\]/g, today)
    .replace(/\[DOCTOR_NAME\]/g, profile.doctorName || 'Dr. Medical Officer')
    .replace(/\[MMC_NUMBER\]/g, profile.mmcNumber || 'MMC 54892')
    .replace(/\[CLINIC_NAME\]/g, profile.clinicName || 'GP Clinic');
}

export function constructVitalsString(v: QuickVitals): string {
  const parts: string[] = [];
  if (v.bp) parts.push(`BP: ${v.bp} mmHg`);
  if (v.hr) parts.push(`HR: ${v.hr} bpm`);
  if (v.rr) parts.push(`RR: ${v.rr} /min`);
  if (v.temp) parts.push(`T: ${v.temp} °C`);
  if (v.spo2) parts.push(`SpO2: ${v.spo2}% on RA`);
  if (v.dxt) parts.push(`DXT: ${v.dxt} mmol/L`);
  if (v.weight) parts.push(`Wt: ${v.weight} kg`);

  return parts.join(' | ') || 'Vitals stable on RA';
}

export function calculateMAP(bp: string): number | null {
  const match = bp.match(/(\d{2,3})\s*\/\s*(\d{2,3})/);
  if (!match) return null;
  const sys = parseInt(match[1], 10);
  const dia = parseInt(match[2], 10);
  if (isNaN(sys) || isNaN(dia) || dia === 0) return null;
  return Math.round((2 * dia + sys) / 3);
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textarea);
      return successful;
    }
  } catch (err) {
    console.error('Failed to copy text: ', err);
    return false;
  }
}
