import React, { useState, useEffect } from 'react';
import { X, Building2, Download, Upload, Check } from 'lucide-react';
import { ClinicProfile, ClinicalTemplate } from '../types/clinical';

interface ClinicProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  clinicProfile: ClinicProfile;
  onSaveProfile: (profile: ClinicProfile) => void;
  templates: ClinicalTemplate[];
  onImportTemplates: (templates: ClinicalTemplate[]) => void;
  onToast: (msg: string) => void;
}

export const ClinicProfileModal: React.FC<ClinicProfileModalProps> = ({
  isOpen,
  onClose,
  clinicProfile,
  onSaveProfile,
  templates,
  onImportTemplates,
  onToast,
}) => {
  const [profile, setProfile] = useState<ClinicProfile>(clinicProfile);

  useEffect(() => {
    setProfile(clinicProfile);
  }, [clinicProfile, isOpen]);

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
    onSaveProfile(profile);
    onToast('Clinic and Doctor credentials saved');
    onClose();
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(templates, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `gp_clinic_templates_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    onToast('Exported templates as JSON backup');
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          onImportTemplates(parsed);
          onToast(`Successfully imported ${parsed.length} templates`);
        } else {
          onToast('Invalid backup file format');
        }
      } catch (err) {
        onToast('Failed to parse backup JSON file');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-modal-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Box */}
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-left">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-700 text-white flex items-center justify-center shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 id="profile-modal-title" className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Clinic Stationery &amp; Practitioner Setup
              </h2>
              <p className="text-xs text-slate-500">
                Populates into printed hospital SBAR referral letters
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg min-w-[36px] min-h-[36px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scroll p-5 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Clinic Name
            </label>
            <input
              type="text"
              required
              value={profile.clinicName}
              onChange={(e) => setProfile({ ...profile, clinicName: e.target.value })}
              placeholder="e.g. Klinik Famili & Surgeri"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-teal-500 outline-none text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Doctor / Attending Name
              </label>
              <input
                type="text"
                required
                value={profile.doctorName}
                onChange={(e) => setProfile({ ...profile, doctorName: e.target.value })}
                placeholder="e.g. Dr. Hafizuddin"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-teal-500 outline-none text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                MMC / Reg No.
              </label>
              <input
                type="text"
                value={profile.mmcNumber}
                onChange={(e) => setProfile({ ...profile, mmcNumber: e.target.value })}
                placeholder="e.g. MMC 54892"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-teal-500 outline-none text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Clinic Address
            </label>
            <input
              type="text"
              value={profile.clinicAddress}
              onChange={(e) => setProfile({ ...profile, clinicAddress: e.target.value })}
              placeholder="e.g. No. 12, Jalan Universiti, Seksyen 11, Shah Alam"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-teal-500 outline-none text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Clinic Telephone
              </label>
              <input
                type="text"
                value={profile.clinicPhone}
                onChange={(e) => setProfile({ ...profile, clinicPhone: e.target.value })}
                placeholder="e.g. +603-5510 8899"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-teal-500 outline-none text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Default Transfer Hospital
              </label>
              <input
                type="text"
                value={profile.defaultHospital}
                onChange={(e) => setProfile({ ...profile, defaultHospital: e.target.value })}
                placeholder="e.g. Hospital Shah Alam / HTAR"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-teal-500 outline-none text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Backup & Restore Strip */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <span className="text-[11px] font-semibold text-slate-500 block uppercase tracking-wider">
              Templates Backup &amp; Migration
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportJson}
                className="flex-1 py-2 px-3 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center gap-1.5 transition text-slate-700 dark:text-slate-300"
              >
                <Download className="w-3.5 h-3.5 text-teal-600" />
                <span>Export JSON Backup</span>
              </button>

              <label className="flex-1 py-2 px-3 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center gap-1.5 transition cursor-pointer text-slate-700 dark:text-slate-300">
                <Upload className="w-3.5 h-3.5 text-teal-600" />
                <span>Import Backup</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportJson}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl shadow-xs transition"
            >
              Save Credentials
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
