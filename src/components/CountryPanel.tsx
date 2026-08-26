import React, { useState, useEffect, useRef } from 'react';
import { CountryMetadata, UserCountryState, Language, CountryStatus } from '../types/country';
import { PALETTE_COLORS, STATUS_PRESETS } from '../data/colors';
import { translations } from '../locales/translations';
import { 
  X, 
  MapPin, 
  FileText, 
  Palette, 
  Check, 
  Trash2, 
  Building, 
  Globe2, 
  Tag, 
  RotateCcw,
  Sparkles,
  ExternalLink
} from 'lucide-react';

interface CountryPanelProps {
  country?: CountryMetadata;
  userState?: UserCountryState;
  onClose: () => void;
  onSetColor: (countryId: string, color: string | undefined) => void;
  onSetNote: (countryId: string, note: string | undefined) => void;
  onSetStatus: (countryId: string, status: CountryStatus | undefined) => void;
  onClear: (countryId: string) => void;
  saveStatus: 'idle' | 'saving' | 'saved';
  language: Language;
}

export const CountryPanel: React.FC<CountryPanelProps> = ({
  country,
  userState,
  onClose,
  onSetColor,
  onSetNote,
  onSetStatus,
  onClear,
  saveStatus,
  language
}) => {
  const t = translations[language];
  const [localNote, setLocalNote] = useState(userState?.note || '');
  const noteDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Sync note when country changes
  useEffect(() => {
    setLocalNote(userState?.note || '');
  }, [country?.id, userState?.note]);

  // Handle note change with debounce auto-save
  const handleNoteChange = (val: string) => {
    setLocalNote(val);
    if (!country) return;

    if (noteDebounceRef.current) {
      clearTimeout(noteDebounceRef.current);
    }
    noteDebounceRef.current = setTimeout(() => {
      onSetNote(country.id, val || undefined);
    }, 450);
  };

  // If no country is selected, show modern empty state
  if (!country) {
    return (
      <aside className="w-full lg:w-80 xl:w-96 bg-white border-t lg:border-t-0 lg:border-l border-slate-200 flex flex-col h-full p-6 text-slate-400 justify-center items-center text-center">
        <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center mb-4 text-blue-600 shadow-xs">
          <Globe2 className="w-7 h-7 opacity-80" />
        </div>
        <h3 className="text-sm font-bold text-slate-800 mb-1.5">
          {t.noCountrySelected}
        </h3>
        <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
          {t.noCountrySelectedDesc}
        </p>
      </aside>
    );
  }

  const activeColor = userState?.color;
  const activeStatus = userState?.status;
  const countryName = language === 'tr' ? country.nameTr : country.nameEn;
  const continentName = language === 'tr' ? country.continentTr : country.continent;
  const capitalName = language === 'tr' ? country.capitalTr : country.capitalEn;

  return (
    <aside className="w-full lg:w-80 xl:w-96 bg-white border-t lg:border-t-0 lg:border-l border-slate-200 flex flex-col h-full text-slate-800 shadow-sm z-20 overflow-y-auto">
      {/* Panel Header */}
      <div className="p-6 border-b border-slate-200 bg-white relative">
        <button
          id="btn-close-country-panel"
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          title={t.close}
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start space-x-3.5 pr-8">
          <span className="text-4xl leading-none drop-shadow-xs select-none">
            {country.flag}
          </span>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-slate-900 truncate tracking-tight">
              {countryName}
            </h2>
            <div className="flex items-center space-x-2 mt-1.5">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                {continentName}
              </span>
              <span className="text-xs font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                {country.iso2} / {country.iso3}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Details Grid */}
        <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 text-xs">
          <div className="flex items-center space-x-2 text-slate-500">
            <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">
              <strong className="text-slate-700 font-medium">{t.capital}:</strong> {capitalName}
            </span>
          </div>
          <div className="flex items-center space-x-2 text-slate-500">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>
              <strong className="text-slate-700 font-medium">{t.isoCode}:</strong> #{country.id}
            </span>
          </div>
        </div>
      </div>

      {/* Panel Body */}
      <div className="p-6 space-y-6 flex-1 flex flex-col">
        {/* Color Picker Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400 flex items-center space-x-1.5">
              <Palette className="w-3 h-3 text-blue-600" />
              <span>{t.colorPalette}</span>
            </label>
            {activeColor && (
              <button
                id="btn-clear-color"
                onClick={() => onSetColor(country.id, undefined)}
                className="text-[11px] text-slate-400 hover:text-rose-600 flex items-center space-x-1 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>{t.clearColor}</span>
              </button>
            )}
          </div>

          {/* Color Swatches Grid */}
          <div className="flex flex-wrap gap-2.5 items-center">
            {PALETTE_COLORS.map((color) => {
              const isSelected = activeColor?.toLowerCase() === color.hex.toLowerCase();
              return (
                <button
                  key={color.id}
                  id={`color-swatch-${color.id}`}
                  onClick={() => onSetColor(country.id, color.hex)}
                  title={language === 'tr' ? color.nameTr : color.nameEn}
                  className={`w-7 h-7 rounded-full transition-all relative flex items-center justify-center border border-black/10 ${
                    isSelected
                      ? 'ring-2 ring-offset-2 ring-blue-600 scale-110 shadow-sm'
                      : 'hover:scale-110 ring-2 ring-transparent ring-offset-1'
                  }`}
                  style={{ backgroundColor: color.hex }}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 text-white drop-shadow-md stroke-[3]" />}
                </button>
              );
            })}

            {/* Custom Color Input Box */}
            <label
              className={`w-7 h-7 rounded-full border border-dashed border-slate-300 hover:border-slate-400 flex items-center justify-center cursor-pointer transition-all bg-slate-50 relative ${
                activeColor && !PALETTE_COLORS.some((c) => c.hex.toLowerCase() === activeColor.toLowerCase())
                  ? 'ring-2 ring-offset-2 ring-blue-600'
                  : ''
              }`}
              title={t.customColor}
              style={{
                backgroundColor:
                  activeColor && !PALETTE_COLORS.some((c) => c.hex.toLowerCase() === activeColor.toLowerCase())
                    ? activeColor
                    : undefined
              }}
            >
              <input
                id="custom-color-picker"
                type="color"
                value={activeColor || '#2563eb'}
                onChange={(e) => onSetColor(country.id, e.target.value)}
                className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
              />
              <Sparkles className="w-3 h-3 text-slate-400" />
            </label>
          </div>
        </div>

        {/* Status / Category Presets */}
        <div>
          <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400 flex items-center space-x-1.5 mb-2.5">
            <Tag className="w-3 h-3 text-emerald-600" />
            <span>{t.status}</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {STATUS_PRESETS.map((st) => {
              const isSelected = activeStatus === st.id;
              const label = language === 'tr' ? st.nameTr : st.nameEn;
              return (
                <button
                  key={st.id}
                  id={`status-preset-${st.id}`}
                  onClick={() => {
                    if (isSelected) {
                      onSetStatus(country.id, undefined);
                    } else {
                      onSetStatus(country.id, st.id as CountryStatus);
                      // Also apply preset color if no color set yet
                      if (!activeColor && st.id !== 'unvisited') {
                        onSetColor(country.id, st.color);
                      }
                    }
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-medium text-left flex items-center space-x-2 transition-all border ${
                    isSelected
                      ? 'bg-blue-50 text-blue-700 border-blue-300 font-semibold shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100/80'
                  }`}
                >
                  <span className="text-sm">{st.icon}</span>
                  <span className="truncate">{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Notes Editor Section */}
        <div className="flex-1 flex flex-col min-h-[180px]">
          <div className="flex items-center justify-between mb-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400 flex items-center space-x-1.5">
              <FileText className="w-3 h-3 text-amber-600" />
              <span>{t.notes}</span>
            </label>
            {/* Live Save Status */}
            <div className="flex items-center space-x-1 text-[11px]">
              {saveStatus === 'saving' && (
                <span className="text-amber-600 animate-pulse font-medium">{t.saving}</span>
              )}
              {saveStatus === 'saved' && (
                <span className="text-emerald-600 font-medium flex items-center gap-0.5">
                  <Check className="w-3 h-3" /> {t.saved}
                </span>
              )}
            </div>
          </div>

          <textarea
            id="country-note-textarea"
            value={localNote}
            onChange={(e) => handleNoteChange(e.target.value)}
            placeholder={t.notePlaceholder}
            rows={7}
            className="flex-1 w-full bg-slate-50 text-sm text-slate-800 placeholder-slate-400 p-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white resize-none leading-relaxed transition-all shadow-xs"
          />
        </div>

        {/* Reset / Delete Country State */}
        {(activeColor || activeStatus || localNote) && (
          <div className="pt-2 border-t border-slate-100 mt-auto">
            <button
              id="btn-reset-country"
              onClick={() => {
                onClear(country.id);
                setLocalNote('');
              }}
              className="w-full py-2.5 px-3 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-semibold flex items-center justify-center space-x-2 transition-colors shadow-xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t.clearColor} & {t.clearNote}</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
