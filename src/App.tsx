import React, { useState, useRef } from 'react';
import { useCountryStates } from './hooks/useCountryStates';
import { Navbar } from './components/Navbar';
import { ContinentFilter } from './components/ContinentFilter';
import { WorldMap } from './components/WorldMap';
import { CountryPanel } from './components/CountryPanel';
import { ColorLegend } from './components/ColorLegend';
import { StatsModal } from './components/StatsModal';
import { translations } from './locales/translations';

export default function App() {
  const {
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
    saveStatus,
    setCountryColor,
    setCountryNote,
    setCountryStatus,
    clearCountry,
    stats,
  } = useCountryStates();

  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const t = translations[language];

  const handleExportMap = () => {
    if (!svgRef.current) return;
    try {
      const svgElement = svgRef.current;
      const serializer = new XMLSerializer();
      let source = serializer.serializeToString(svgElement);
      if (!source.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)) {
        source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
      }
      if (!source.match(/^<svg[^>]+xmlns:xlink="http:\/\/www\.w3\.org\/1999\/xlink"/)) {
        source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
      }
      const svgBlob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `world-mosaic-map-${new Date().toISOString().slice(0, 10)}.svg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting map:', err);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#F8F9FA] text-slate-800 overflow-hidden font-sans select-none">
      <Navbar
        language={language}
        onLanguageChange={changeLanguage}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchResults={searchResults}
        onSelectCountry={(id) => setSelectedCountryId(id)}
        onOpenStats={() => setIsStatsOpen(true)}
        onExportMap={handleExportMap}
        stats={stats}
      />

      <ContinentFilter
        selectedContinent={selectedContinent}
        onSelectContinent={(cId) => setSelectedContinent(cId)}
        language={language}
        continentCounts={stats.continentCounts}
      />

      {/* Desktop: map + sidebar side-by-side. Mobile: map first, panel below with page scrolling. */}
      <div className="flex-1 flex flex-col lg:flex-row relative min-h-0 overflow-y-auto lg:overflow-hidden">
        <main className="flex-none lg:flex-1 relative h-[52vh] min-h-[360px] lg:h-auto lg:min-h-0 overflow-hidden">
          <WorldMap
            countryStates={countryStates}
            selectedCountryId={selectedCountryId}
            onSelectCountry={(id) => setSelectedCountryId(id)}
            selectedContinent={selectedContinent}
            language={language}
            svgRefProp={svgRef}
          />
          <ColorLegend countryStates={countryStates} language={language} />
        </main>

        <div className="flex-none lg:flex lg:h-full lg:min-h-0">
          <CountryPanel
            country={selectedCountry}
            userState={selectedState}
            onClose={() => setSelectedCountryId(null)}
            onSetColor={setCountryColor}
            onSetNote={setCountryNote}
            onSetStatus={setCountryStatus}
            onClear={clearCountry}
            saveStatus={saveStatus}
            language={language}
          />
        </div>
      </div>

      <StatsModal
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        language={language}
        countryStates={countryStates}
        onStatesImported={() => window.location.reload()}
        stats={stats}
      />
    </div>
  );
}
