import React, { useState, useRef, useEffect } from 'react';
import { Search, Globe, BarChart3, Download, Layers, X, Check } from 'lucide-react';
import { Language, CountryMetadata } from '../types/country';
import { translations } from '../locales/translations';

interface NavbarProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  searchResults: CountryMetadata[];
  onSelectCountry: (countryId: string) => void;
  onOpenStats: () => void;
  onExportMap: () => void;
  stats: {
    total: number;
    markedCount: number;
    percentage: number;
  };
}

export const Navbar: React.FC<NavbarProps> = ({
  language,
  onLanguageChange,
  searchQuery,
  onSearchChange,
  searchResults,
  onSelectCountry,
  onOpenStats,
  onExportMap,
  stats
}) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const t = translations[language];

  // Close search dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-slate-200 text-slate-800 flex items-center justify-between px-4 sm:px-6 relative z-30 shadow-xs">
      {/* Brand & Logo */}
      <div className="flex items-center space-x-3">
        <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-xs text-white font-black text-xl">
          <Globe className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="font-bold text-lg tracking-tight text-slate-900 flex items-center gap-1.5">
              <span>World Mosaic</span>
            </h1>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Pro
            </span>
          </div>
          <p className="text-xs text-slate-500 hidden sm:block">
            {t.appTagline}
          </p>
        </div>
      </div>

      {/* Global Country Search Bar */}
      <div className="flex-1 max-w-md mx-3 sm:mx-6 relative" ref={searchContainerRef}>
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="country-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => {
              onSearchChange(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
            placeholder={t.searchPlaceholder}
            className="w-full bg-slate-50 text-sm text-slate-900 placeholder-slate-400 pl-10 pr-9 py-2 rounded-full border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => {
                onSearchChange('');
                setIsSearchOpen(false);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5 rounded-full"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Autocomplete Search Dropdown */}
        {isSearchOpen && searchQuery.trim().length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-50 max-h-80 overflow-y-auto">
            {searchResults.length > 0 ? (
              <div className="py-1 divide-y divide-slate-100">
                {searchResults.map((country) => (
                  <button
                    key={country.id}
                    onClick={() => {
                      onSelectCountry(country.id);
                      setIsSearchOpen(false);
                      onSearchChange('');
                    }}
                    className="w-full px-4 py-2.5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors group"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-xl leading-none">{country.flag}</span>
                      <div>
                        <span className="text-sm font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                          {language === 'tr' ? country.nameTr : country.nameEn}
                        </span>
                        <span className="text-xs text-slate-400 ml-2 font-mono">
                          ({country.iso2} / {country.iso3})
                        </span>
                        <div className="text-[11px] text-slate-500">
                          {language === 'tr' ? country.continentTr : country.continent} • {language === 'tr' ? country.capitalTr : country.capitalEn}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-slate-600 font-mono bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {country.iso2}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="px-4 py-4 text-center text-sm text-slate-500">
                {t.noResults}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons & Language Switcher */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Quick Stats Pill */}
        <button
          id="btn-open-stats"
          onClick={onOpenStats}
          className="flex items-center space-x-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-medium transition-all shadow-xs"
          title={t.stats}
        >
          <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
          <span className="hidden md:inline">{t.coloredCountries}:</span>
          <span className="text-blue-600 font-bold">
            {stats.markedCount}/{stats.total}
          </span>
          <span className="text-[10px] text-slate-600 bg-white px-1.5 py-0.5 rounded-full font-mono border border-slate-200">
            %{stats.percentage}
          </span>
        </button>

        {/* Export Image Map */}
        <button
          id="btn-export-map"
          onClick={onExportMap}
          className="flex items-center space-x-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors shadow-xs"
          title={t.exportMap}
        >
          <Download className="w-3.5 h-3.5 text-emerald-600" />
          <span className="hidden lg:inline">{t.exportMap}</span>
        </button>

        {/* Language Switcher */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
          <button
            id="btn-lang-tr"
            onClick={() => onLanguageChange('tr')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              language === 'tr'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            TR
          </button>
          <button
            id="btn-lang-en"
            onClick={() => onLanguageChange('en')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              language === 'en'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            EN
          </button>
        </div>
      </div>
    </header>
  );
};
