import React from 'react';
import { CONTINENTS } from '../data/continents';
import { Language } from '../types/country';
import { translations } from '../locales/translations';
import { Globe, Compass } from 'lucide-react';

interface ContinentFilterProps {
  selectedContinent: string;
  onSelectContinent: (continentId: string) => void;
  language: Language;
  continentCounts?: Record<string, { total: number; marked: number }>;
}

export const ContinentFilter: React.FC<ContinentFilterProps> = ({
  selectedContinent,
  onSelectContinent,
  language,
  continentCounts
}) => {
  const t = translations[language];

  return (
    <div className="bg-white/95 backdrop-blur-sm border-b border-slate-200 px-4 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
      <div className="flex items-center space-x-1.5 text-xs text-slate-400 font-bold uppercase tracking-wider mr-2 shrink-0">
        <Compass className="w-3.5 h-3.5 text-blue-600" />
        <span className="text-[11px]">{t.continents}:</span>
      </div>

      <div className="flex items-center space-x-1.5">
        {CONTINENTS.map((cont) => {
          const isSelected = selectedContinent === cont.id;
          const stats = cont.id !== 'all' ? continentCounts?.[cont.id] : undefined;
          const label = language === 'tr' ? cont.nameTr : cont.nameEn;

          return (
            <button
              key={cont.id}
              id={`continent-filter-${cont.id.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => onSelectContinent(cont.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center space-x-1.5 ${
                isSelected
                  ? 'bg-slate-900 text-white font-semibold shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900 border border-slate-200/80'
              }`}
            >
              <span>{label}</span>
              {stats && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isSelected
                      ? 'bg-slate-800 text-slate-200'
                      : stats.marked > 0
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-200/80 text-slate-500'
                  }`}
                >
                  {stats.marked}/{stats.total}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
