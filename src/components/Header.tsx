import React, { useRef, useEffect } from 'react';
import {
  Search,
  X,
  Menu,
  Moon,
  Sun,
  Plus,
  Stethoscope,
  Building2,
  Bookmark,
  AlertTriangle,
} from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onlyEmergencies: boolean;
  onToggleEmergencies: () => void;
  onlyBookmarks: boolean;
  onToggleBookmarks: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenMobileMenu: () => void;
  onOpenAddModal: () => void;
  onOpenProfileModal: () => void;
  totalFilteredCount: number;
  bookmarkCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  onlyEmergencies,
  onToggleEmergencies,
  onlyBookmarks,
  onToggleBookmarks,
  isDark,
  onToggleTheme,
  onOpenMobileMenu,
  onOpenAddModal,
  onOpenProfileModal,
  totalFilteredCount,
  bookmarkCount,
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Global hotkey: "/" or "Ctrl+K" focuses search; "Esc" clears
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === '/' || (e.ctrlKey && e.key === 'k') || (e.metaKey && e.key === 'k')) &&
          document.activeElement?.tagName !== 'INPUT' &&
          document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'Escape' && document.activeElement === searchInputRef.current) {
        onSearchChange('');
        searchInputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSearchChange]);

  return (
    <header className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 transition-colors">
      {/* Top Bar Zone: One single row fulfilling Top Bar contract */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-6">
        
        {/* Left: Mobile hamburger + Brand */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={onOpenMobileMenu}
            aria-label="Open clinic navigation menu"
            className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:text-teal-700 dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:outline-none transition min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <Menu className="w-5 h-5" aria-hidden="true" />
          </button>

          <a
            href="/"
            className="flex items-center gap-2 group text-left focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:outline-none rounded-lg"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-teal-700 text-white flex items-center justify-center shrink-0 shadow-sm group-hover:bg-teal-800 transition">
              <Stethoscope className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm sm:text-base font-bold tracking-tight text-slate-900 dark:text-white leading-tight whitespace-nowrap">
                GP ClinicDay
              </span>
              <span className="hidden sm:inline text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Clinical SOAP &amp; SBAR Suite
              </span>
            </div>
          </a>
        </div>

        {/* Center: Global Instant Search (expanded on desktop, compact on mobile) */}
        <div className="flex-1 max-w-lg mx-1 sm:mx-2">
          <div className="relative w-full">
            <Search
              className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search symptoms, diagnoses, drugs (e.g. STEMI, fits, back pain)..."
              aria-label="Search clinical templates by symptom, diagnosis, or medication"
              className="w-full pl-9 pr-8 sm:pr-14 py-1.5 sm:py-2 text-xs sm:text-sm bg-slate-100/90 dark:bg-slate-800/80 border border-transparent focus:border-teal-500 focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-teal-500/20 transition-all placeholder:text-slate-400"
            />
            {searchQuery ? (
              <button
                onClick={() => onSearchChange('')}
                aria-label="Clear search input"
                className="absolute right-2 sm:right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-md focus-visible:ring-1 focus-visible:ring-teal-500"
              >
                <X className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            ) : (
              <kbd className="hidden sm:inline-flex items-center absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-1.5 py-0.5 rounded shadow-2xs pointer-events-none">
                /
              </kbd>
            )}
          </div>
        </div>

        {/* Right Zone: Quick filters, theme switch, clinic profile & primary action */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          
          {/* Emergency Triage Toggle (desktop/tablet) */}
          <button
            onClick={onToggleEmergencies}
            aria-pressed={onlyEmergencies}
            title={onlyEmergencies ? 'Show all cases' : 'Filter emergency transfers only'}
            className={`hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition border ${
              onlyEmergencies
                ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-rose-400 hover:text-rose-600'
            }`}
          >
            <AlertTriangle className={`w-3.5 h-3.5 ${onlyEmergencies ? 'text-white' : 'text-rose-600'}`} aria-hidden="true" />
            <span className="whitespace-nowrap">Emergencies</span>
          </button>

          {/* Bookmarks Toggle (desktop/tablet) */}
          <button
            onClick={onToggleBookmarks}
            aria-pressed={onlyBookmarks}
            title="Show saved bookmarked cases"
            className={`hidden md:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition border ${
              onlyBookmarks
                ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:text-teal-700'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${onlyBookmarks ? 'fill-current text-white' : 'text-slate-500'}`} aria-hidden="true" />
            <span className="whitespace-nowrap">Favorites</span>
            {bookmarkCount > 0 && (
              <span className={`text-[10px] px-1 py-0.2 rounded font-mono ${onlyBookmarks ? 'bg-teal-800 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                {bookmarkCount}
              </span>
            )}
          </button>

          {/* Case counter badge (desktop) */}
          <span className="hidden xl:inline-flex items-center px-2 py-1 rounded-md text-[11px] font-mono text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <span className="font-bold text-teal-600 dark:text-teal-400 mr-1">{totalFilteredCount}</span> cases
          </span>

          {/* Clinic Station Settings */}
          <button
            onClick={onOpenProfileModal}
            aria-label="Configure Clinic and Doctor Profile"
            title="Clinic &amp; Doctor Profile"
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-teal-700 dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:outline-none transition min-w-[40px] min-h-[40px] flex items-center justify-center"
          >
            <Building2 className="w-4 h-4" aria-hidden="true" />
          </button>

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={onToggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-teal-700 dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:outline-none transition min-w-[40px] min-h-[40px] flex items-center justify-center"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400" aria-hidden="true" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" aria-hidden="true" />
            )}
          </button>

          {/* Primary Action Button: Add Custom Template */}
          <button
            onClick={onOpenAddModal}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-semibold shadow-xs focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 transition active:scale-98 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" aria-hidden="true" />
            <span>New Case</span>
          </button>

        </div>

      </div>
    </header>
  );
};
