import React, { useState, useEffect } from 'react';
import {
  X,
  Copy,
  Check,
  Printer,
  Heart,
  Thermometer,
  Gauge,
  Activity,
  FileText,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { ClinicalTemplate, ClinicProfile, QuickVitals } from '../types/clinical';
import {
  formatSoapNote,
  formatReferralLetter,
  calculateMAP,
  copyToClipboard,
} from '../utils/clinicalUtils';

interface TemplateModalProps {
  template: ClinicalTemplate | null;
  clinicProfile: ClinicProfile;
  isOpen: boolean;
  onClose: () => void;
  onPrintReferral: (template: ClinicalTemplate) => void;
  onToast: (msg: string) => void;
}

export const TemplateModal: React.FC<TemplateModalProps> = ({
  template,
  clinicProfile,
  isOpen,
  onClose,
  onPrintReferral,
  onToast,
}) => {
  const [activeTab, setActiveTab] = useState<'soap' | 'sbar'>('soap');
  const [editableContent, setEditableContent] = useState('');
  const [copied, setCopied] = useState(false);

  const [vitals, setVitals] = useState<QuickVitals>({
    bp: '',
    hr: '',
    temp: '',
    spo2: '',
    rr: '',
    dxt: '',
    weight: '',
  });

  // Sync content when template changes or modal opens
  useEffect(() => {
    if (template && isOpen) {
      setEditableContent(formatSoapNote(template));
      setActiveTab('soap');
      setCopied(false);

      // Attempt to extract existing vitals from template
      const vitalsText = template.data.vitals;
      const bpMatch = vitalsText.match(/BP:\s*([\d/]+)/i);
      const hrMatch = vitalsText.match(/HR:\s*(\d+)/i);
      const tempMatch = vitalsText.match(/T:\s*([\d.]+)/i);
      const spo2Match = vitalsText.match(/SpO2:\s*(\d+)/i);
      const rrMatch = vitalsText.match(/RR:\s*(\d+)/i);
      const dxtMatch = vitalsText.match(/DXT:\s*([\d.]+)/i);
      const wtMatch = vitalsText.match(/Wt:\s*([\d.]+)/i);

      setVitals({
        bp: bpMatch ? bpMatch[1] : '',
        hr: hrMatch ? hrMatch[1] : '',
        temp: tempMatch ? tempMatch[1] : '',
        spo2: spo2Match ? spo2Match[1] : '',
        rr: rrMatch ? rrMatch[1] : '',
        dxt: dxtMatch ? dxtMatch[1] : '',
        weight: wtMatch ? wtMatch[1] : '',
      });
    }
  }, [template, isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !template) return null;

  const handleTabSwitch = (tab: 'soap' | 'sbar') => {
    setActiveTab(tab);
    if (tab === 'sbar') {
      setEditableContent(formatReferralLetter(template, clinicProfile));
    } else {
      setEditableContent(formatSoapNote(template));
    }
  };

  const handleReset = () => {
    if (activeTab === 'sbar') {
      setEditableContent(formatReferralLetter(template, clinicProfile));
    } else {
      setEditableContent(formatSoapNote(template));
    }
    onToast('Reset to original template text');
  };

  const applyVitalsToNote = () => {
    const parts: string[] = [];
    if (vitals.bp) parts.push(`BP: ${vitals.bp} mmHg`);
    if (vitals.hr) parts.push(`HR: ${vitals.hr} bpm`);
    if (vitals.rr) parts.push(`RR: ${vitals.rr} /min`);
    if (vitals.temp) parts.push(`T: ${vitals.temp} °C`);
    if (vitals.spo2) parts.push(`SpO2: ${vitals.spo2}% on RA`);
    if (vitals.dxt) parts.push(`Capillary DXT: ${vitals.dxt} mmol/L`);
    if (vitals.weight) parts.push(`Weight: ${vitals.weight} kg`);

    const vitalsLine = parts.length > 0 ? parts.join(' | ') : 'Vitals stable on RA';

    if (activeTab === 'soap') {
      const vitalsRegex = /VITAL SIGNS:\n[^\n]*/;
      if (vitalsRegex.test(editableContent)) {
        setEditableContent(editableContent.replace(vitalsRegex, `VITAL SIGNS:\n${vitalsLine}`));
      } else {
        setEditableContent(editableContent + `\n\nVITAL SIGNS:\n${vitalsLine}`);
      }
      onToast('Vitals applied to SOAP note');
    } else {
      // In referral letter
      const vitalsRegex = /Vitals at Clinic:[^\n]*/;
      if (vitalsRegex.test(editableContent)) {
        setEditableContent(editableContent.replace(vitalsRegex, `Vitals at Clinic: ${vitalsLine}`));
      }
      onToast('Vitals updated in referral letter');
    }
  };

  const insertMcDuration = (days: number | string) => {
    if (typeof days === 'number') {
      const mcSnippet = `\n- Medical Certificate (MC) issued for ${days} day${days > 1 ? 's' : ''}.`;
      setEditableContent((prev) => prev + mcSnippet);
      onToast(`Added MC (${days} day${days > 1 ? 's' : ''})`);
    } else {
      const mcSnippet = `\n- ${days}`;
      setEditableContent((prev) => prev + mcSnippet);
      onToast(`Added ${days}`);
    }
  };

  const handleCopy = async () => {
    const ok = await copyToClipboard(editableContent);
    if (ok) {
      setCopied(true);
      onToast('Clinical note copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const mapValue = calculateMAP(vitals.bp);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="template-modal-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Box */}
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-150 text-left">
        
        {/* Modal Header */}
        <div className="px-4 py-3.5 sm:px-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs">
              {template.isEmergency ? (
                <span className="font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
                  EMERGENCY REFERRAL
                </span>
              ) : (
                <span className="font-semibold text-teal-700 dark:text-teal-400">
                  {template.category.replace('_', ' ').toUpperCase()}
                </span>
              )}
              <span className="text-slate-300 dark:text-slate-700">·</span>
              <span className="text-slate-500 font-mono text-[11px]">{template.demographics}</span>
            </div>
            <h2
              id="template-modal-title"
              className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight mt-0.5"
            >
              {template.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg min-w-[40px] min-h-[40px] flex items-center justify-center transition"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto custom-scroll p-4 sm:p-6 space-y-4">
          
          {/* Quick Vitals Auto-Fill Panel */}
          <section className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 uppercase tracking-wide">
                <Activity className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" aria-hidden="true" />
                <span>Quick Vitals Auto-Injector</span>
              </span>
              {mapValue !== null && (
                <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                  Calculated MAP: <strong className="text-teal-600 dark:text-teal-400">{mapValue} mmHg</strong>
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-0.5">
                  BP (mmHg)
                </label>
                <input
                  type="text"
                  placeholder="120/80"
                  value={vitals.bp}
                  onChange={(e) => setVitals({ ...vitals, bp: e.target.value })}
                  className="w-full px-2 py-1.5 text-xs font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:border-teal-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-0.5">
                  HR (bpm)
                </label>
                <input
                  type="text"
                  placeholder="76"
                  value={vitals.hr}
                  onChange={(e) => setVitals({ ...vitals, hr: e.target.value })}
                  className="w-full px-2 py-1.5 text-xs font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:border-teal-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-0.5">
                  Temp (°C)
                </label>
                <input
                  type="text"
                  placeholder="37.0"
                  value={vitals.temp}
                  onChange={(e) => setVitals({ ...vitals, temp: e.target.value })}
                  className="w-full px-2 py-1.5 text-xs font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:border-teal-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-0.5">
                  SpO2 (%)
                </label>
                <input
                  type="text"
                  placeholder="99"
                  value={vitals.spo2}
                  onChange={(e) => setVitals({ ...vitals, spo2: e.target.value })}
                  className="w-full px-2 py-1.5 text-xs font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:border-teal-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-0.5">
                  RR (/min)
                </label>
                <input
                  type="text"
                  placeholder="18"
                  value={vitals.rr}
                  onChange={(e) => setVitals({ ...vitals, rr: e.target.value })}
                  className="w-full px-2 py-1.5 text-xs font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:border-teal-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-0.5">
                  DXT (mmol/L)
                </label>
                <input
                  type="text"
                  placeholder="6.5"
                  value={vitals.dxt}
                  onChange={(e) => setVitals({ ...vitals, dxt: e.target.value })}
                  className="w-full px-2 py-1.5 text-xs font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:border-teal-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-0.5">
                  Weight (kg)
                </label>
                <input
                  type="text"
                  placeholder="65"
                  value={vitals.weight}
                  onChange={(e) => setVitals({ ...vitals, weight: e.target.value })}
                  className="w-full px-2 py-1.5 text-xs font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:border-teal-500 outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end pt-1">
              <button
                type="button"
                onClick={applyVitalsToNote}
                className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-semibold shadow-2xs active:scale-98 transition flex items-center gap-1.5"
              >
                <span>Update Vitals in Note</span>
              </button>
            </div>
          </section>

          {/* Quick MC Pills (for faster clinic workflows) */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mr-1">
              Quick Add MC:
            </span>
            <button
              onClick={() => insertMcDuration(1)}
              className="px-2.5 py-1 rounded-md text-xs font-medium border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-300 transition"
            >
              + 1 Day MC
            </button>
            <button
              onClick={() => insertMcDuration(2)}
              className="px-2.5 py-1 rounded-md text-xs font-medium border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-300 transition"
            >
              + 2 Days MC
            </button>
            <button
              onClick={() => insertMcDuration(3)}
              className="px-2.5 py-1 rounded-md text-xs font-medium border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-300 transition"
            >
              + 3 Days MC
            </button>
            <button
              onClick={() => insertMcDuration('Light duty recommended x 3 days.')}
              className="px-2.5 py-1 rounded-md text-xs font-medium border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-300 transition"
            >
              + Light Duties
            </button>
          </div>

          {/* Tab Selector & Reset Button */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleTabSwitch('soap')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                  activeTab === 'soap'
                    ? 'bg-teal-700 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Standard SOAP Note
              </button>

              {template.data.referralLetter && (
                <button
                  onClick={() => handleTabSwitch('sbar')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 ${
                    activeTab === 'sbar'
                      ? 'bg-rose-600 text-white shadow-2xs'
                      : 'text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>SBAR Referral Letter</span>
                </button>
              )}
            </div>

            <button
              onClick={handleReset}
              title="Reset note text to initial template"
              className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Reset</span>
            </button>
          </div>

          {/* Editable Text Area */}
          <div>
            <textarea
              value={editableContent}
              onChange={(e) => setEditableContent(e.target.value)}
              rows={14}
              className="w-full p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm font-mono leading-relaxed text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:border-teal-500 outline-none custom-scroll resize-y"
              placeholder="Clinical documentation text..."
            />
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-4 py-3 sm:px-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between gap-3">
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            Directly edits what is copied to your clinic EMR / hospital referral.
          </span>

          <div className="flex items-center gap-2 ml-auto">
            {activeTab === 'sbar' && (
              <button
                onClick={() => onPrintReferral(template)}
                className="px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition"
              >
                <Printer className="w-4 h-4" aria-hidden="true" />
                <span>Print Preview</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-3.5 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-300 transition"
            >
              Close
            </button>

            <button
              onClick={handleCopy}
              className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs active:scale-98 transition"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" aria-hidden="true" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" aria-hidden="true" />
                  <span>Copy Text</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
