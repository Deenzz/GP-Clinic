import React from 'react';
import { CategoryKey } from '../types/clinical';
import { CATEGORIES } from '../data/masterTemplates';
import { AlertTriangle } from 'lucide-react';

interface CategoryNavProps {
  selectedCategory: CategoryKey;
  onSelectCategory: (cat: CategoryKey) => void;
  categoryCounts: Record<CategoryKey, number>;
}

export const CategoryNav: React.FC<CategoryNavProps> = ({
  selectedCategory,
  onSelectCategory,
  categoryCounts,
}) => {
  return (
    <nav
      aria-label="Clinical Categories"
      className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-3 sm:px-6 py-2 transition-colors sticky top-14 sm:top-16 z-30"
    >
      <div className="max-w-7xl mx-auto flex items-center gap-1.5 overflow-x-auto custom-scroll pb-1">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.key;
          const isEmergency = cat.key === 'emergency';
          const count = categoryCounts[cat.key] || 0;

          if (isEmergency) {
            return (
              <button
                key={cat.key}
                onClick={() => onSelectCategory(cat.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 flex items-center gap-1.5 transition border ${
                  isSelected
                    ? 'bg-rose-600 text-white border-rose-600 shadow-2xs'
                    : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900/60 hover:bg-rose-100 dark:hover:bg-rose-900/40'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{cat.label}</span>
                <span className={`text-[10px] font-mono px-1 rounded ${
                  isSelected ? 'bg-rose-700 text-white' : 'bg-rose-200/70 dark:bg-rose-900 text-rose-800 dark:text-rose-200'
                }`}>
                  {count}
                </span>
              </button>
            );
          }

          return (
            <button
              key={cat.key}
              onClick={() => onSelectCategory(cat.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 flex items-center gap-1.5 transition ${
                isSelected
                  ? 'bg-teal-700 text-white font-semibold shadow-2xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>{cat.label}</span>
              <span className={`text-[10px] font-mono px-1 rounded ${
                isSelected ? 'bg-teal-800 text-teal-100' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
