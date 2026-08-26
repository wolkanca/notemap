import React, { useState } from 'react';
import { UserCountryState, Language } from '../types/country';
import { translations } from '../locales/translations';
import { COUNTRIES_DATA } from '../data/countriesData';
import { exportStatesAsJson, importStatesFromJson } from '../services/countryStorage';
import { 
  X, 
  BarChart3, 
  Globe2, 
  Download, 
  Upload, 
  Check, 
  FileText, 
  Sparkles,
  PieChart
} from 'lucide-react';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  countryStates: Record<string, UserCountryState>;
  onStatesImported: () => void;
  stats: {
    total: number;
    markedCount: number;
    withNotesCount: number;
    percentage: number;
    continentCounts: Record<string, { total: number; marked: number }>;
  };
}

export const StatsModal: React.FC<StatsModalProps> = ({
  isOpen,
  onClose,
  language,
  countryStates,
  onStatesImported,
  stats
}) => {
  const [importText, setImportText] = useState('');
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const t = translations[language];

  if (!isOpen) return null;

  const handleDownloadBackup = () => {
    const jsonStr = exportStatesAsJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `world-mosaic-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    if (!importText.trim()) return;
    const result = importStatesFromJson(importText);
    if (result) {
      setImportStatus('success');
      onStatesImported();
      setTimeout(() => {
        setImportStatus('idle');
        setImportText('');
      }, 1500);
    } else {
      setImportStatus('error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-white">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900">
                {t.stats}
              </h3>
              <p className="text-xs text-slate-500">
                {t.appTagline}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Scrollable */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-800">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-center">
              <span className="text-2xl font-black text-blue-600">
                {stats.markedCount}
              </span>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                {t.coloredCountries}
              </p>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-center">
              <span className="text-2xl font-black text-emerald-600">
                {stats.withNotesCount}
              </span>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                {t.notesCount}
              </p>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-center">
              <span className="text-2xl font-black text-amber-600">
                %{stats.percentage}
              </span>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                {t.worldCoverage}
              </p>
            </div>
          </div>

          {/* Continent Progress Breakdown */}
          <div>
            <h4 className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-3">
              {t.continents}
            </h4>
            <div className="space-y-2.5">
              {(Object.entries(stats.continentCounts) as [string, { total: number; marked: number }][]).map(([continent, data]) => {
                const percent = data.total > 0 ? Math.round((data.marked / data.total) * 100) : 0;
                return (
                  <div key={continent} className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div className="flex justify-between items-center text-xs mb-1.5 font-medium">
                      <span className="text-slate-800 font-semibold">{continent}</span>
                      <span className="text-slate-500 font-mono text-[11px]">
                        {data.marked} / {data.total} (%{percent})
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Backup & Export Data */}
          <div className="pt-4 border-t border-slate-200">
            <h4 className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-3 flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span>{language === 'tr' ? 'Veri Yedekleme & Geri Yükleme' : 'Data Backup & Restore'}</span>
            </h4>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleDownloadBackup}
                className="flex-1 py-2.5 px-4 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 transition-colors shadow-xs"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>{language === 'tr' ? 'JSON Olarak İndir (Export)' : 'Download Backup (JSON)'}</span>
              </button>
            </div>

            <div className="mt-3">
              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder={language === 'tr' ? 'JSON yedeğinizi buraya yapıştırıp içe aktarabilirsiniz...' : 'Paste your JSON backup here to import...'}
                rows={3}
                className="w-full bg-slate-50 text-xs font-mono text-slate-800 placeholder-slate-400 p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
              />
              <div className="flex items-center justify-between mt-2">
                <button
                  onClick={handleImport}
                  disabled={!importText.trim()}
                  className="py-1.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-xs"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{language === 'tr' ? 'İçe Aktar (Import JSON)' : 'Import (JSON)'}</span>
                </button>
                {importStatus === 'success' && (
                  <span className="text-emerald-600 text-xs flex items-center gap-1 font-medium">
                    <Check className="w-3.5 h-3.5" /> {language === 'tr' ? 'Başarıyla yüklendi!' : 'Successfully imported!'}
                  </span>
                )}
                {importStatus === 'error' && (
                  <span className="text-rose-600 text-xs font-medium">
                    {language === 'tr' ? 'Geçersiz JSON formatı!' : 'Invalid JSON format!'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-white flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
