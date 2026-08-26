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

  // Export Map handler (SVG snapshot download)
  const handleExportMap = () => {
    if (!svgRef.current) return;
    try {
      const svgElement = svgRef.current;
      const serializer = new XMLSerializer();
      let source = serializer.serializeToString(svgElement);

      // Add name spaces
      if (!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
        source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
      }
      if (!source.match(/^<svg[^>]+xmlns:xlink="http\:\/\/www\.w3\.org\/1999\/xlink"/)) {
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
      {/* Top Navigation Bar */}
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

      {/* Continent Navigation Filter */}
      <ContinentFilter
        selectedContinent={selectedContinent}
        onSelectContinent={(cId) => setSelectedContinent(cId)}
        language={language}
        continentCounts={stats.continentCounts}
      />

      {/* Main Workspace Area (Map + Side Panel) */}
      <div className="flex-1 flex flex-col lg:flex-row relative overflow-hidden">
        {/* World Map Interactive Viewport */}
        <main className="flex-1 relative h-[60vh] lg:h-auto overflow-hidden">
          <WorldMap
            countryStates={countryStates}
            selectedCountryId={selectedCountryId}
            onSelectCountry={(id) => setSelectedCountryId(id)}
            selectedContinent={selectedContinent}
            language={language}
            svgRefProp={svgRef}
          />

          {/* Color Legend overlay */}
          <ColorLegend countryStates={countryStates} language={language} />
        </main>

        {/* Selected Country Details & Notes Sidebar */}
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

      {/* Statistics & Backup Modal */}
      <StatsModal
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        language={language}
        countryStates={countryStates}
        onStatesImported={() => {
          // Trigger refresh of stats
          window.location.reload();
        }}
        stats={stats}
      />
    </div>
  );
}
