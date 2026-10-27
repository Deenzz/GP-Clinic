import React, { useEffect } from 'react';
import { X, Printer, Copy, Check, Building2 } from 'lucide-react';
import { ClinicalTemplate, ClinicProfile } from '../types/clinical';
import { formatReferralLetter, copyToClipboard } from '../utils/clinicalUtils';

interface PrintLetterModalProps {
  template: ClinicalTemplate | null;
  clinicProfile: ClinicProfile;
  isOpen: boolean;
  onClose: () => void;
  onToast: (msg: string) => void;
}

export const PrintLetterModal: React.FC<PrintLetterModalProps> = ({
  template,
  clinicProfile,
  isOpen,
  onClose,
  onToast,
}) => {
  const [copied, setCopied] = React.useState(false);

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

  const letterContent = formatReferralLetter(template, clinicProfile);
  const today = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = async () => {
    const ok = await copyToClipboard(letterContent);
    if (ok) {
      setCopied(true);
      onToast('Hospital Referral Letter copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="print-modal-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in no-print"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-left z-10 print-container">
        
        {/* Controls Header (hidden during print) */}
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between no-print">
          <div>
            <h2 id="print-modal-title" className="text-sm font-bold text-slate-900 dark:text-white">
              Official Hospital Referral Letter
            </h2>
            <span className="text-xs text-slate-500">Ready for print or direct copy to Hospital ED</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-xs font-semibold rounded-lg text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Letter</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg min-w-[36px] min-h-[36px] flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Paper Canvas */}
        <div className="flex-1 overflow-y-auto custom-scroll p-6 sm:p-10 bg-slate-50 dark:bg-slate-950 font-serif">
          
          <div className="max-w-2xl mx-auto bg-white text-slate-900 p-8 sm:p-10 rounded-xl shadow-xs border border-slate-200 text-left space-y-6">
            
            {/* Clinic Letterhead */}
            <div className="border-b-2 border-slate-800 pb-4 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight font-sans">
                  {clinicProfile.clinicName || 'KLINIK FAMILI & SURGERI'}
                </h1>
                <p className="text-xs text-slate-600 font-sans mt-0.5">
                  {clinicProfile.clinicAddress}
                </p>
                <p className="text-xs text-slate-600 font-sans">
                  Tel: {clinicProfile.clinicPhone}
                </p>
              </div>
              <div className="text-right hidden sm:block font-sans text-xs text-slate-500">
                <span className="font-semibold text-slate-800">{clinicProfile.doctorName}</span>
                <div>{clinicProfile.mmcNumber}</div>
              </div>
            </div>

            {/* Letter Content formatted in monospaced or crisp serif */}
            <pre className="font-mono text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
              {letterContent}
            </pre>

            {/* Doctor Signature & Clinic Stamp Block */}
            <div className="pt-8 border-t border-slate-200 grid grid-cols-2 gap-8 font-sans">
              <div>
                <p className="text-[11px] text-slate-400 uppercase tracking-wider mb-8">
                  Attending Medical Officer Signature
                </p>
                <div className="border-b border-slate-400 w-48 mb-1"></div>
                <p className="text-xs font-bold text-slate-800">{clinicProfile.doctorName}</p>
                <p className="text-[11px] text-slate-600">{clinicProfile.mmcNumber}</p>
              </div>

              <div className="flex flex-col items-end justify-center">
                <div className="w-36 h-20 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center text-slate-400 text-[10px] text-center p-2">
                  <Building2 className="w-5 h-5 mb-1 text-slate-300" />
                  <span>Official Clinic Stamp</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
