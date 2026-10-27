import React, { useEffect } from 'react';
import {
  X,
  AlertTriangle,
  Bookmark,
  Plus,
  Building2,
  Stethoscope,
  ChevronRight,
  Layers,
  Brain,
  Activity,
  Wind,
  Baby,
  Sparkles,
  HeartPulse,
  HeartHandshake,
  Eye,
  FileText,
} from 'lucide-react';
import { CategoryKey, ClinicalTemplate } from '../types/clinical';
import { CATEGORIES } from '../data/masterTemplates';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCategory: CategoryKey;
  onSelectCategory: (cat: CategoryKey) => void;
  onlyEmergencies: boolean;
  onToggleEmergencies: () => void;
  onlyBookmarks: boolean;
  onToggleBookmarks: () => void;
  onOpenAddModal: () => void;
  onOpenProfileModal: () => void;
  templates: ClinicalTemplate[];
  bookmarks: string[];
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  selectedCategory,
  onSelectCategory,
  onlyEmergencies,
  onToggleEmergencies,
  onlyBookmarks,
  onToggleBookmarks,
  onOpenAddModal,
  onOpenProfileModal,
  templates,
  bookmarks,
}) => {
  // Close drawer on Escape key
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

  const getCategoryIcon = (key: CategoryKey) => {
    switch (key) {
      case 'emergency': return <AlertTriangle className="w-4 h-4 text-rose-600" />;
      case 'neuro_headache': return <Brain className="w-4 h-4 text-indigo-500" />;
      case 'msk_trauma': return <Activity className="w-4 h-4 text-amber-500" />;
      case 'urti_resp': return <Wind className="w-4 h-4 text-cyan-500" />;
      case 'paeds': return <Baby className="w-4 h-4 text-pink-500" />;
      case 'git': return <FileText className="w-4 h-4 text-emerald-500" />;
      case 'derma_infect': return <Sparkles className="w-4 h-4 text-orange-500" />;
      case 'ncd_dm': return <HeartPulse className="w-4 h-4 text-red-500" />;
      case 'ong': return <HeartHandshake className="w-4 h-4 text-purple-500" />;
      case 'eye_ent': return <Eye className="w-4 h-4 text-teal-500" />;
      default: return <Layers className="w-4 h-4 text-slate-500" />;
    }
  };

  const getCategoryCount = (key: CategoryKey) => {
    if (key === 'all') return templates.length;
    if (key === 'emergency') return templates.filter(t => t.isEmergency).length;
    return templates.filter(t => t.category === key).length;
  };

  return (
    <div className="fixed inset-0 z-50 md:hidden flex" role="dialog" aria-modal="true" aria-label="Mobile Navigation Menu">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Content */}
      <div className="relative w-4/5 max-w-sm bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col border-r border-slate-200 dark:border-slate-800 animate-in slide-in-from-left duration-200">
        
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-700 text-white flex items-center justify-center shrink-0">
              <Stethoscope className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                GP ClinicDay
              </h2>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Case Templates &amp; Referrals
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close navigation menu"
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Action strip inside drawer */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 space-y-2">
          <button
            onClick={() => {
              onOpenAddModal();
              onClose();
            }}
            className="w-full py-2.5 px-3 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition min-h-[44px]"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>Create New Case Template</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                onToggleEmergencies();
                onClose();
              }}
              className={`py-2 px-2.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 border transition min-h-[44px] ${
                onlyEmergencies
                  ? 'bg-rose-600 text-white border-rose-600'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              <AlertTriangle className={`w-3.5 h-3.5 ${onlyEmergencies ? 'text-white' : 'text-rose-600'}`} />
              <span>Emergencies</span>
            </button>

            <button
              onClick={() => {
                onToggleBookmarks();
                onClose();
              }}
              className={`py-2 px-2.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 border transition min-h-[44px] ${
                onlyBookmarks
                  ? 'bg-teal-700 text-white border-teal-700'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${onlyBookmarks ? 'fill-current text-white' : 'text-slate-500'}`} />
              <span>Saved ({bookmarks.length})</span>
            </button>
          </div>
        </div>

        {/* Scrollable Categories List */}
        <div className="flex-1 overflow-y-auto custom-scroll p-3 space-y-1">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 py-1">
            Clinical Disciplines
          </div>
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.key;
            const count = getCategoryCount(cat.key);

            return (
              <button
                key={cat.key}
                onClick={() => {
                  onSelectCategory(cat.key);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition min-h-[44px] ${
                  isSelected
                    ? 'bg-teal-700 text-white shadow-xs font-semibold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={isSelected ? 'text-white' : ''}>
                    {getCategoryIcon(cat.key)}
                  </span>
                  <span>{cat.label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`text-[11px] font-mono px-1.5 py-0.5 rounded ${
                    isSelected
                      ? 'bg-teal-800 text-teal-100'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                  }`}>
                    {count}
                  </span>
                  <ChevronRight className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-400'}`} aria-hidden="true" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Drawer Footer: Clinic profile config */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30">
          <button
            onClick={() => {
              onOpenProfileModal();
              onClose();
            }}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition min-h-[44px]"
          >
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-500" aria-hidden="true" />
              <span>Clinic &amp; Doctor Details</span>
            </div>
            <span className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold">Configure</span>
          </button>
        </div>

      </div>
    </div>
  );
};
