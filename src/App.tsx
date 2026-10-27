import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  AlertTriangle,
  Bookmark,
  Plus,
  RefreshCw,
  Search,
  FilterX,
  Sparkles,
  HeartHandshake,
  CheckCircle2,
} from 'lucide-react';
import { CategoryKey, ClinicalTemplate, ClinicProfile } from './types/clinical';
import { MASTER_TEMPLATES, DEFAULT_CLINIC_PROFILE, CATEGORIES } from './data/masterTemplates';
import { Header } from './components/Header';
import { MobileDrawer } from './components/MobileDrawer';
import { CategoryNav } from './components/CategoryNav';
import { TemplateCard } from './components/TemplateCard';
import { TemplateModal } from './components/TemplateModal';
import { PrintLetterModal } from './components/PrintLetterModal';
import { AddCaseModal } from './components/AddCaseModal';
import { ClinicProfileModal } from './components/ClinicProfileModal';
import { Toast } from './components/Toast';

export default function App() {
  // Theme state
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('gp_theme');
      if (stored) return stored === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  // Apply theme to document
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('gp_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('gp_theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => !prev);
  }, []);

  // Templates state
  const [templates, setTemplates] = useState<ClinicalTemplate[]>(() => {
    try {
      const storedCustom = localStorage.getItem('gp_custom_templates');
      if (storedCustom) {
        const custom: ClinicalTemplate[] = JSON.parse(storedCustom);
        return [...MASTER_TEMPLATES, ...custom];
      }
    } catch (e) {
      console.error('Error loading custom templates:', e);
    }
    return MASTER_TEMPLATES;
  });

  // Bookmarks state
  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('gp_bookmarks');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Clinic profile state
  const [clinicProfile, setClinicProfile] = useState<ClinicProfile>(() => {
    try {
      const stored = localStorage.getItem('gp_clinic_profile');
      return stored ? JSON.parse(stored) : DEFAULT_CLINIC_PROFILE;
    } catch {
      return DEFAULT_CLINIC_PROFILE;
    }
  });

  // Filter & Navigation states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>('all');
  const [onlyEmergencies, setOnlyEmergencies] = useState(false);
  const [onlyBookmarks, setOnlyBookmarks] = useState(false);

  // Modals & Drawers state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeEditTemplate, setActiveEditTemplate] = useState<ClinicalTemplate | null>(null);
  const [activePrintTemplate, setActivePrintTemplate] = useState<ClinicalTemplate | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 2500);
  }, []);

  // Toggle bookmark handler
  const handleToggleBookmark = useCallback(
    (id: string) => {
      setBookmarks((prev) => {
        let updated: string[];
        if (prev.includes(id)) {
          updated = prev.filter((item) => item !== id);
          showToast('Removed from favorites');
        } else {
          updated = [...prev, id];
          showToast('Saved to favorites');
        }
        try {
          localStorage.setItem('gp_bookmarks', JSON.stringify(updated));
        } catch (e) {
          console.error(e);
        }
        return updated;
      });
    },
    [showToast]
  );

  // Save new custom template
  const handleSaveCustomTemplate = useCallback(
    (newTemplate: ClinicalTemplate) => {
      setTemplates((prev) => {
        const updated = [newTemplate, ...prev];
        const customOnly = updated.filter((t) => t.isCustom);
        try {
          localStorage.setItem('gp_custom_templates', JSON.stringify(customOnly));
        } catch (e) {
          console.error(e);
        }
        return updated;
      });
    },
    []
  );

  // Save clinic profile
  const handleSaveProfile = useCallback((profile: ClinicProfile) => {
    setClinicProfile(profile);
    try {
      localStorage.setItem('gp_clinic_profile', JSON.stringify(profile));
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Import JSON backup
  const handleImportTemplates = useCallback(
    (imported: ClinicalTemplate[]) => {
      // Merge unique templates by ID
      setTemplates((prev) => {
        const map = new Map<string, ClinicalTemplate>();
        prev.forEach((t) => map.set(t.id, t));
        imported.forEach((t) => map.set(t.id, t));
        const merged = Array.from(map.values());
        const customOnly = merged.filter((t) => t.isCustom);
        try {
          localStorage.setItem('gp_custom_templates', JSON.stringify(customOnly));
        } catch (e) {
          console.error(e);
        }
        return merged;
      });
    },
    []
  );

  // Category counts computation
  const categoryCounts = useMemo(() => {
    const counts: Record<CategoryKey, number> = {
      all: templates.length,
      emergency: 0,
      neuro_headache: 0,
      msk_trauma: 0,
      urti_resp: 0,
      paeds: 0,
      git: 0,
      derma_infect: 0,
      ncd_dm: 0,
      ong: 0,
      eye_ent: 0,
    };

    templates.forEach((t) => {
      if (t.isEmergency) counts.emergency++;
      if (counts[t.category] !== undefined && t.category !== 'all') {
        counts[t.category]++;
      }
    });

    return counts;
  }, [templates]);

  // Filtered templates list
  const filteredTemplates = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return templates.filter((t) => {
      // Emergency filter
      if (onlyEmergencies && !t.isEmergency) return false;

      // Bookmarks filter
      if (onlyBookmarks && !bookmarks.includes(t.id)) return false;

      // Category filter
      if (selectedCategory !== 'all') {
        if (selectedCategory === 'emergency') {
          if (!t.isEmergency) return false;
        } else if (t.category !== selectedCategory) {
          return false;
        }
      }

      // Query search
      if (!q) return true;

      const titleMatch = t.title.toLowerCase().includes(q);
      const impMatch = t.data.imp.toLowerCase().includes(q);
      const pwMatch = t.data.pw.toLowerCase().includes(q);
      const planMatch = t.data.plan.toLowerCase().includes(q);
      const demoMatch = t.demographics.toLowerCase().includes(q);
      const tagMatch = t.tags.some((tag) => tag.toLowerCase().includes(q));

      return titleMatch || impMatch || pwMatch || planMatch || demoMatch || tagMatch;
    });
  }, [templates, searchQuery, selectedCategory, onlyEmergencies, onlyBookmarks, bookmarks]);

  const clearAllFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedCategory('all');
    setOnlyEmergencies(false);
    setOnlyBookmarks(false);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/70 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors">
      
      {/* Top Header */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onlyEmergencies={onlyEmergencies}
        onToggleEmergencies={() => setOnlyEmergencies((v) => !v)}
        onlyBookmarks={onlyBookmarks}
        onToggleBookmarks={() => setOnlyBookmarks((v) => !v)}
        isDark={isDark}
        onToggleTheme={toggleTheme}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        totalFilteredCount={filteredTemplates.length}
        bookmarkCount={bookmarks.length}
      />

      {/* Category Navigation Bar (Desktop & Tablet) */}
      <CategoryNav
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        categoryCounts={categoryCounts}
      />

      {/* Main Content Viewport */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-5 sm:py-7 flex-1 w-full">
        
        {/* Active Filter Indicators / Breadcrumb Row */}
        {(onlyEmergencies || onlyBookmarks || selectedCategory !== 'all' || searchQuery) && (
          <div className="mb-4 flex items-center justify-between gap-2 flex-wrap text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span>Active view:</span>
              {onlyEmergencies && (
                <span className="font-semibold text-rose-700 dark:text-rose-400">
                  Emergencies Only
                </span>
              )}
              {onlyBookmarks && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="font-semibold text-teal-700 dark:text-teal-400">
                    Favorites Only ({bookmarks.length})
                  </span>
                </>
              )}
              {selectedCategory !== 'all' && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    Category: {CATEGORIES.find((c) => c.key === selectedCategory)?.label}
                  </span>
                </>
              )}
              {searchQuery && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>Query &ldquo;{searchQuery}&rdquo;</span>
                </>
              )}
              <span aria-hidden="true">·</span>
              <span className="font-mono">{filteredTemplates.length} matches</span>
            </div>

            <button
              onClick={clearAllFilters}
              className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline flex items-center gap-1"
            >
              <FilterX className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Clear filters</span>
            </button>
          </div>
        )}

        {/* Templates Grid */}
        {filteredTemplates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filteredTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                clinicProfile={clinicProfile}
                isBookmarked={bookmarks.includes(template.id)}
                onToggleBookmark={handleToggleBookmark}
                onEdit={(t) => setActiveEditTemplate(t)}
                onPrintReferral={(t) => setActivePrintTemplate(t)}
                onToast={showToast}
              />
            ))}
          </div>
        ) : (
          /* Accessible Empty State */
          <div className="py-20 text-center space-y-4 max-w-md mx-auto">
            <div className="w-14 h-14 bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-2xl flex items-center justify-center mx-auto shadow-2xs">
              <Search className="w-6 h-6" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-200">
                No matching clinical templates found
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                We couldn&rsquo;t find any case matching &ldquo;{searchQuery || selectedCategory}&rdquo;. Try another symptom, diagnosis, or clear active filters.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-center gap-2">
              <button
                onClick={clearAllFilters}
                className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-semibold shadow-2xs transition"
              >
                Reset All Filters
              </button>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition"
              >
                Create Custom Template
              </button>
            </div>
          </div>
        )}

      </main>

      {/* Quiet, Accessible Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-4 px-4 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-700 dark:text-slate-300">GP ClinicDay Suite</span>
            <span aria-hidden="true">·</span>
            <span>General Practice Clinical Clerking &amp; Hospital Referral Generator</span>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span>{clinicProfile.clinicName}</span>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="text-teal-700 dark:text-teal-400 hover:underline"
            >
              Station Profile
            </button>
          </div>
        </div>
      </footer>

      {/* Mobile Off-Canvas Navigation Drawer */}
      <MobileDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        onlyEmergencies={onlyEmergencies}
        onToggleEmergencies={() => setOnlyEmergencies((v) => !v)}
        onlyBookmarks={onlyBookmarks}
        onToggleBookmarks={() => setOnlyBookmarks((v) => !v)}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        templates={templates}
        bookmarks={bookmarks}
      />

      {/* Template Quick Edit & Vitals Modal */}
      <TemplateModal
        template={activeEditTemplate}
        clinicProfile={clinicProfile}
        isOpen={Boolean(activeEditTemplate)}
        onClose={() => setActiveEditTemplate(null)}
        onPrintReferral={(t) => {
          setActiveEditTemplate(null);
          setActivePrintTemplate(t);
        }}
        onToast={showToast}
      />

      {/* Hospital Referral Letter Print View Modal */}
      <PrintLetterModal
        template={activePrintTemplate}
        clinicProfile={clinicProfile}
        isOpen={Boolean(activePrintTemplate)}
        onClose={() => setActivePrintTemplate(null)}
        onToast={showToast}
      />

      {/* Add Custom Clinical Case Modal */}
      <AddCaseModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveCustomTemplate}
        onToast={showToast}
      />

      {/* Clinic & Doctor Stationery Profile Modal */}
      <ClinicProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        clinicProfile={clinicProfile}
        onSaveProfile={handleSaveProfile}
        templates={templates}
        onImportTemplates={handleImportTemplates}
        onToast={showToast}
      />

      {/* Accessible Toast Notification */}
      <Toast message={toastMessage} />

    </div>
  );
}
