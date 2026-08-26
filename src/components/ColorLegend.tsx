import React, { useState } from 'react';
import { PALETTE_COLORS, STATUS_PRESETS } from '../data/colors';
import { UserCountryState, Language } from '../types/country';
import { translations } from '../locales/translations';
import { Layers, ChevronUp, ChevronDown } from 'lucide-react';

interface ColorLegendProps {
  countryStates: Record<string, UserCountryState>;
  language: Language;
}

export const ColorLegend: React.FC<ColorLegendProps> = ({ countryStates, language }) => {
  const [isOpen, setIsOpen] = useState(true);
  const t = translations[language];

  // Calculate counts for colors
  const colorCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    (Object.values(countryStates) as UserCountryState[]).forEach((st) => {
      if (st && st.color) {
        const hex = st.color.toLowerCase();
        counts[hex] = (counts[hex] || 0) + 1;
      }
    });
    return counts;
  }, [countryStates]);

  return (
    <div className="absolute bottom-5 right-5 z-20 max-w-xs bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl shadow-lg text-slate-800 overflow-hidden transition-all duration-200">
      {/* Header */}
      <button
        id="btn-toggle-legend"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors bg-slate-50/80 border-b border-slate-100"
      >
        <div className="flex items-center space-x-2">
          <Layers className="w-3.5 h-3.5 text-blue-600" />
          <span>{t.legendTitle}</span>
        </div>
        {isOpen ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronUp className="w-3.5 h-3.5 text-slate-400" />}
      </button>

      {/* Content */}
      {isOpen && (
        <div className="p-3 space-y-1 max-h-56 overflow-y-auto text-xs">
          {PALETTE_COLORS.map((col) => {
            const count = colorCounts[col.hex.toLowerCase()] || 0;
            const label = language === 'tr' ? col.nameTr : col.nameEn;
            return (
              <div key={col.id} className="flex items-center justify-between py-1 px-1.5 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="flex items-center space-x-2 min-w-0">
                  <span
                    className="w-3 h-3 rounded-full shrink-0 shadow-xs border border-black/10"
                    style={{ backgroundColor: col.hex }}
                  />
                  <span className="text-slate-600 truncate text-[11px] font-medium">{label}</span>
                </div>
                <span className="font-mono text-[11px] text-slate-400 font-semibold ml-2">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
