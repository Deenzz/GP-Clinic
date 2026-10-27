import React, { useState, useEffect } from 'react';
import { X, Plus, AlertTriangle } from 'lucide-react';
import { ClinicalTemplate, CategoryKey } from '../types/clinical';
import { CATEGORIES } from '../data/masterTemplates';

interface AddCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (template: ClinicalTemplate) => void;
  onToast: (msg: string) => void;
}

export const AddCaseModal: React.FC<AddCaseModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onToast,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<CategoryKey>('urti_resp');
  const [isEmergency, setIsEmergency] = useState(false);
  const [demographics, setDemographics] = useState('Adult (30 Years)');
  const [tags, setTags] = useState('');
  const [underlying, setUnderlying] = useState('NKMI | NKDA');
  const [pw, setPw] = useState('');
  const [vitals, setVitals] = useState('BP: 120/80 mmHg | HR: 76 bpm | T: 37.0 °C | SpO2: 99% on RA');
  const [oe, setOe] = useState('General: Alert, conscious, comfortable at rest.\nLungs: Clear bilaterally.');
  const [imp, setImp] = useState('');
  const [plan, setPlan] = useState('');
  const [referralLetter, setReferralLetter] = useState('');

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

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !imp.trim()) {
      onToast('Please provide a title and impression/diagnosis');
      return;
    }

    const newTemplate: ClinicalTemplate = {
      id: `custom_${Date.now()}`,
      title: title.trim(),
      category: isEmergency ? 'emergency' : category,
      isEmergency,
      demographics: demographics.trim(),
      tags: tags
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean),
      data: {
        underlying: underlying.trim(),
        pw: pw.trim(),
        vitals: vitals.trim(),
        oe: oe.trim(),
        imp: imp.trim(),
        plan: plan.trim(),
        referralLetter: referralLetter.trim() || undefined,
      },
      isCustom: true,
      updatedAt: Date.now(),
    };

    onSave(newTemplate);
    onToast(`Added custom template: ${title}`);
    onClose();

    // Reset form
    setTitle('');
    setPw('');
    setImp('');
    setPlan('');
    setReferralLetter('');
    setIsEmergency(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-modal-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Box */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-left">
        
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 id="add-modal-title" className="text-base font-bold text-slate-900 dark:text-white">
              Create New Clinical Case Template
            </h2>
            <p className="text-xs text-slate-500">
              Save customized clinical cases and referral letters directly into your suite
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg min-w-[36px] min-h-[36px] flex items-center justify-center"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scroll p-5 space-y-4 text-xs">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Case Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Acute Otitis Media / Earache"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-teal-500 outline-none text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CategoryKey)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-teal-500 outline-none text-slate-900 dark:text-slate-100"
              >
                {CATEGORIES.filter((c) => c.key !== 'all').map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Typical Demographics
              </label>
              <input
                type="text"
                value={demographics}
                onChange={(e) => setDemographics(e.target.value)}
                placeholder="e.g. Adult Male (32 Years)"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-teal-500 outline-none text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Emergency Toggle */}
          <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700">
            <input
              type="checkbox"
              id="is-emergency-check"
              checked={isEmergency}
              onChange={(e) => setIsEmergency(e.target.checked)}
              className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
            />
            <label htmlFor="is-emergency-check" className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 cursor-pointer">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Mark as Emergency / Hospital Referral Case</span>
            </label>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Search Tags (comma separated)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g. otitis media, ear pain, amoxicillin, fever"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-teal-500 outline-none text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Underlying Medical History / Allergies
            </label>
            <input
              type="text"
              value={underlying}
              onChange={(e) => setUnderlying(e.target.value)}
              placeholder="e.g. NKMI | NKDA"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-teal-500 outline-none text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Presenting Complaints (P/W)
            </label>
            <textarea
              rows={3}
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              placeholder="1. Left ear pain x 2 days&#10;2. Low grade fever x 1 day"
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-mono focus:border-teal-500 outline-none text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Standard Baseline Vitals
            </label>
            <input
              type="text"
              value={vitals}
              onChange={(e) => setVitals(e.target.value)}
              placeholder="BP: 120/80 mmHg | HR: 76 bpm | T: 37.0 °C | SpO2: 99% on RA"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-mono focus:border-teal-500 outline-none text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Physical Examination (O/E)
            </label>
            <textarea
              rows={3}
              value={oe}
              onChange={(e) => setOe(e.target.value)}
              placeholder="Otoscopy: Bulging erythematous left tympanic membrane with loss of light reflex. Right TM normal."
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-mono focus:border-teal-500 outline-none text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Impression / Diagnosis (IMP/DX) *
            </label>
            <input
              type="text"
              required
              value={imp}
              onChange={(e) => setImp(e.target.value)}
              placeholder="e.g. Acute Otitis Media (Left)"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-teal-500 outline-none text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Management Plan &amp; Medications
            </label>
            <textarea
              rows={4}
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              placeholder="1. Tab. Amoxicillin 500 mg TDS x 5 days&#10;2. Tab. Paracetamol 1000 mg TDS PRN&#10;3. Medical Certificate (MC) issued for 1 day."
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-mono focus:border-teal-500 outline-none text-slate-900 dark:text-slate-100"
            />
          </div>

          {isEmergency && (
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                SBAR Hospital Referral Letter (Optional)
              </label>
              <textarea
                rows={5}
                value={referralLetter}
                onChange={(e) => setReferralLetter(e.target.value)}
                placeholder="EMERGENCY REFERRAL LETTER&#10;To: Medical Officer on Duty&#10;Date: [DATE]..."
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-mono focus:border-teal-500 outline-none text-slate-900 dark:text-slate-100"
              />
            </div>
          )}

          {/* Form Actions */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl shadow-xs transition"
            >
              Save Template
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
