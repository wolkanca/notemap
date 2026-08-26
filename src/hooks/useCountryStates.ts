import { useState, useEffect, useCallback, useMemo } from 'react';
import { CountryMetadata, UserCountryState, Language, CountryStatus } from '../types/country';
import { COUNTRIES_DATA, getCountryById, getCountryByIso } from '../data/countriesData';
import { loadAllCountryStates, saveCountryState, removeCountryState } from '../services/countryStorage';

export function useCountryStates() {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('world-mosaic-lang');
    return (saved === 'en' || saved === 'tr') ? saved : 'tr';
  });

  const [countryStates, setCountryStates] = useState<Record<string, UserCountryState>>(() => {
    return loadAllCountryStates();
  });

  const [selectedCountryId, setSelectedCountryId] = useState<string | null>(null);
  const [selectedContinent, setSelectedContinent] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<CountryStatus | 'all'>('all');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Persist language
  const changeLanguage = useCallback((lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('world-mosaic-lang', lang);
  }, []);

  // Sync with storage on mount
  useEffect(() => {
    const data = loadAllCountryStates();
    setCountryStates(data);
  }, []);

  const selectedCountry = useMemo<CountryMetadata | undefined>(() => {
    if (!selectedCountryId) return undefined;
    return getCountryById(selectedCountryId);
  }, [selectedCountryId]);

  const selectedState = useMemo<UserCountryState | undefined>(() => {
    if (!selectedCountryId) return undefined;
    return countryStates[selectedCountryId] || undefined;
  }, [selectedCountryId, countryStates]);

  // Update country color
  const setCountryColor = useCallback((countryId: string, color: string | undefined) => {
    setSaveStatus('saving');
    const updated = saveCountryState(countryId, { color: color || undefined });
    setCountryStates(updated);
    setTimeout(() => setSaveStatus('saved'), 300);
    setTimeout(() => setSaveStatus('idle'), 2000);
  }, []);

  // Update country note
  const setCountryNote = useCallback((countryId: string, note: string | undefined) => {
    setSaveStatus('saving');
    const updated = saveCountryState(countryId, { note: note || undefined });
    setCountryStates(updated);
    setTimeout(() => setSaveStatus('saved'), 300);
    setTimeout(() => setSaveStatus('idle'), 2000);
  }, []);

  // Update country status
  const setCountryStatus = useCallback((countryId: string, status: CountryStatus | undefined) => {
    setSaveStatus('saving');
    const updated = saveCountryState(countryId, { status: status || undefined });
    setCountryStates(updated);
    setTimeout(() => setSaveStatus('saved'), 300);
    setTimeout(() => setSaveStatus('idle'), 2000);
  }, []);

  // Clear country data
  const clearCountry = useCallback((countryId: string) => {
    const updated = removeCountryState(countryId);
    setCountryStates(updated);
  }, []);

  // Search filter
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    return COUNTRIES_DATA.filter((c) => {
      return (
        c.nameTr.toLowerCase().includes(q) ||
        c.nameEn.toLowerCase().includes(q) ||
        c.iso2.toLowerCase() === q ||
        c.iso3.toLowerCase() === q ||
        c.capitalTr.toLowerCase().includes(q) ||
        c.capitalEn.toLowerCase().includes(q)
      );
    }).slice(0, 8);
  }, [searchQuery]);

  // Stats calculation
  const stats = useMemo(() => {
    const total = COUNTRIES_DATA.length;
    const markedIds = Object.keys(countryStates).filter((id) => {
      const s = countryStates[id];
      return !!(s?.color || s?.note || s?.status);
    });
    const markedCount = markedIds.length;
    const withNotesCount = (Object.values(countryStates) as UserCountryState[]).filter((s) => !!s?.note?.trim()).length;

    // Continent breakdown
    const continentCounts: Record<string, { total: number; marked: number }> = {};
    COUNTRIES_DATA.forEach((c) => {
      if (!continentCounts[c.continent]) {
        continentCounts[c.continent] = { total: 0, marked: 0 };
      }
      continentCounts[c.continent].total += 1;
      if (countryStates[c.id]?.color || countryStates[c.id]?.status) {
        continentCounts[c.continent].marked += 1;
      }
    });

    return {
      total,
      markedCount,
      withNotesCount,
      percentage: total > 0 ? Math.round((markedCount / total) * 100) : 0,
      continentCounts
    };
  }, [countryStates]);

  return {
    language,
    changeLanguage,
    countryStates,
    selectedCountryId,
    setSelectedCountryId,
    selectedCountry,
    selectedState,
    selectedContinent,
    setSelectedContinent,
    searchQuery,
    setSearchQuery,
    searchResults,
    statusFilter,
    setStatusFilter,
    saveStatus,
    setCountryColor,
    setCountryNote,
    setCountryStatus,
    clearCountry,
    stats,
  };
}
