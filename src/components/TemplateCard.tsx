import React, { useState } from 'react';
import {
  Copy,
  Check,
  Edit3,
  FileText,
  AlertTriangle,
  Bookmark,
  Printer,
} from 'lucide-react';
import { ClinicalTemplate, ClinicProfile } from '../types/clinical';
import { formatSoapNote, formatReferralLetter, copyToClipboard } from '../utils/clinicalUtils';

interface TemplateCardProps {
  template: ClinicalTemplate;
  clinicProfile: ClinicProfile;
  isBookmarked: boolean;
  onToggleBookmark: (id: string) => void;
  onEdit: (template: ClinicalTemplate) => void;
  onPrintReferral: (template: ClinicalTemplate) => void;
  onToast: (msg: string) => void;
}

export const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  clinicProfile,
  isBookmarked,
  onToggleBookmark,
  onEdit,
  onPrintReferral,
  onToast,
}) => {
  const [copiedSoap, setCopiedSoap] = useState(false);
  const [copiedSbar, setCopiedSbar] = useState(false);

  const handleCopySoap = async () => {
    const text = formatSoapNote(template);
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedSoap(true);
      onToast(`Copied SOAP Note: ${template.title}`);
      setTimeout(() => setCopiedSoap(false), 2000);
    }
  };

  const handleCopySbar = async () => {
    const text = formatReferralLetter(template, clinicProfile);
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedSbar(true);
      onToast(`Copied Hospital SBAR Referral Letter`);
      setTimeout(() => setCopiedSbar(false), 2000);
    }
  };

  const isEmg = template.isEmergency;
  const pwFirstLine = template.data.pw.split('\n')[0].replace(/^\d+\.\s*/, '');
  const planFirstLine = template.data.plan.split('\n')[0].replace(/^\d+\.\s*/, '');

  return (
    <article
      className={`relative rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all duration-150 border text-left ${
        isEmg
          ? 'bg-rose-50/25 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60 hover:border-rose-400 dark:hover:border-rose-700'
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
      } shadow-xs hover:shadow-sm`}
    >
      <div>
        {/* Unboxed Metadata Line (Zero-Pill Compliance) */}
        <div className="flex items-center justify-between gap-2 text-xs mb-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            {isEmg ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 dark:text-rose-400">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>EMERGENCY TRANSFER</span>
              </span>
            ) : (
              <span className="text-[11px] font-semibold text-teal-700 dark:text-teal-400">
                {template.category.replace('_', ' ').toUpperCase()}
              </span>
            )}
            <span className="text-slate-300 dark:text-slate-700" aria-hidden="true">·</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
              {template.demographics}
            </span>
          </div>

          {/* Bookmark Button */}
          <button
            onClick={() => onToggleBookmark(template.id)}
            aria-label={isBookmarked ? 'Remove from favorites' : 'Add to favorites'}
            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition min-w-[32px] min-h-[32px] flex items-center justify-center"
          >
            <Bookmark
              className={`w-4 h-4 ${
                isBookmarked
                  ? 'fill-amber-400 text-amber-500 dark:fill-amber-400 dark:text-amber-400'
                  : ''
              }`}
              aria-hidden="true"
            />
          </button>
        </div>

        {/* Title */}
        <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug tracking-tight">
          {template.title}
        </h3>

        {/* Impression / Diagnosis Kicker */}
        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mt-1.5 font-medium">
          {template.data.imp}
        </p>

        {/* Clinical Snippets */}
        <div className="mt-3 p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800/80 text-[11px] font-mono space-y-1 text-slate-600 dark:text-slate-300">
          <p className="truncate">
            <span className="font-semibold text-slate-400">P/W: </span>
            {pwFirstLine}
          </p>
          <p className="truncate">
            <span className="font-semibold text-slate-400">PLAN: </span>
            {planFirstLine}
          </p>
        </div>
      </div>

      {/* Card Actions */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1.5 flex-wrap">
        
        {/* Left Action: Edit & Vitals Tweaker */}
        <button
          onClick={() => onEdit(template)}
          className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 active:scale-98 transition min-h-[36px]"
        >
          <Edit3 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" aria-hidden="true" />
          <span>Edit / Vitals</span>
        </button>

        {/* Right Actions: SBAR Referral & Copy SOAP */}
        <div className="flex items-center gap-1.5">
          {template.data.referralLetter && (
            <>
              <button
                onClick={() => onPrintReferral(template)}
                title="Print official Hospital Referral Letter"
                aria-label="Print Referral Letter"
                className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900 transition min-w-[36px] min-h-[36px] flex items-center justify-center"
              >
                <Printer className="w-3.5 h-3.5" aria-hidden="true" />
              </button>

              <button
                onClick={handleCopySbar}
                title="Copy SBAR Referral Letter to Clipboard"
                aria-label="Copy SBAR Referral Letter"
                className="px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1 shadow-2xs active:scale-98 transition min-h-[36px]"
              >
                {copiedSbar ? (
                  <>
                    <Check className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-3.5 h-3.5" aria-hidden="true" />
                    <span className="hidden sm:inline">SBAR Letter</span>
                    <span className="sm:hidden">SBAR</span>
                  </>
                )}
              </button>
            </>
          )}

          <button
            onClick={handleCopySoap}
            title="Copy SOAP Note to Clipboard"
            aria-label="Copy SOAP Note"
            className="px-3 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs active:scale-98 transition min-h-[36px]"
          >
            {copiedSoap ? (
              <>
                <Check className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Copy SOAP</span>
              </>
            )}
          </button>
        </div>

      </div>
    </article>
  );
};
