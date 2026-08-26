import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { geoNaturalEarth1, geoPath, geoGraticule } from 'd3-geo';
import { getWorldGeoData } from '../data/worldMapData';
import { getCountryById } from '../data/countriesData';
import { CONTINENTS } from '../data/continents';
import { CountryMetadata, UserCountryState, Language } from '../types/country';
import { translations } from '../locales/translations';
import { ZoomIn, ZoomOut, RotateCcw, Compass, MapPin, Sparkles } from 'lucide-react';

interface WorldMapProps {
  countryStates: Record<string, UserCountryState>;
  selectedCountryId: string | null;
  onSelectCountry: (countryId: string) => void;
  selectedContinent: string;
  language: Language;
  svgRefProp?: React.RefObject<SVGSVGElement | null>;
}

export const WorldMap: React.FC<WorldMapProps> = ({
  countryStates,
  selectedCountryId,
  onSelectCountry,
  selectedContinent,
  language,
  svgRefProp
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const internalSvgRef = useRef<SVGSVGElement>(null);
  const svgRef = svgRefProp || internalSvgRef;

  const [dimensions, setDimensions] = useState({ width: 960, height: 500 });
  const [transform, setTransform] = useState<{ x: number; y: number; k: number }>({ x: 0, y: 0, k: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoveredCountry, setHoveredCountry] = useState<{
    country: CountryMetadata;
    x: number;
    y: number;
  } | null>(null);

  const t = translations[language];

  // Container resize observer
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setDimensions({ width, height });
        }
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // TopoJSON Geo Data
  const geoData = useMemo(() => {
    return getWorldGeoData();
  }, []);

  // D3 Projection & Path
  const { pathGenerator, graticulePath } = useMemo(() => {
    const projection = geoNaturalEarth1()
      .scale(dimensions.width / 5.8)
      .translate([dimensions.width / 2, dimensions.height / 2 + 10]);

    const path = geoPath().projection(projection);
    const graticule = geoGraticule();
    return {
      pathGenerator: path,
      graticulePath: path(graticule()) || ''
    };
  }, [dimensions]);

  // Handle continent change zoom/center
  useEffect(() => {
    const cont = CONTINENTS.find((c) => c.id === selectedContinent);
    if (!cont) return;

    if (cont.id === 'all') {
      setTransform({ x: 0, y: 0, k: 1 });
    } else {
      // Zoom into continent center
      const [lon, lat] = cont.center;
      const projection = geoNaturalEarth1()
        .scale(dimensions.width / 5.8)
        .translate([dimensions.width / 2, dimensions.height / 2 + 10]);

      const projected = projection([lon, lat]);
      if (projected) {
        const [px, py] = projected;
        const targetK = cont.zoom;
        const targetX = dimensions.width / 2 - px * targetK;
        const targetY = dimensions.height / 2 - py * targetK;
        setTransform({ x: targetX, y: targetY, k: targetK });
      }
    }
  }, [selectedContinent, dimensions]);

  // Zoom controls
  const handleZoom = useCallback((direction: 'in' | 'out') => {
    setTransform((prev) => {
      const factor = direction === 'in' ? 1.35 : 0.75;
      const newK = Math.min(Math.max(prev.k * factor, 0.7), 10);
      const cx = dimensions.width / 2;
      const cy = dimensions.height / 2;
      const newX = cx - (cx - prev.x) * (newK / prev.k);
      const newY = cy - (cy - prev.y) * (newK / prev.k);
      return { x: newX, y: newY, k: newK };
    });
  }, [dimensions]);

  const handleReset = useCallback(() => {
    setTransform({ x: 0, y: 0, k: 1 });
  }, []);

  // Mouse pan handling
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only left click
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setTransform((prev) => ({
        ...prev,
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      }));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85;
    setTransform((prev) => {
      const newK = Math.min(Math.max(prev.k * zoomFactor, 0.7), 12);
      const newX = mouseX - (mouseX - prev.x) * (newK / prev.k);
      const newY = mouseY - (mouseY - prev.y) * (newK / prev.k);
      return { x: newX, y: newY, k: newK };
    });
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative overflow-hidden bg-[#F8F9FA] select-none flex flex-col cursor-grab active:cursor-grabbing"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => {
        setIsDragging(false);
        setHoveredCountry(null);
      }}
      onWheel={handleWheel}
    >
      {/* Background Ocean & Compass Grid */}
      <svg
        ref={svgRef}
        id="world-map-svg"
        className="w-full h-full absolute inset-0"
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
      >
        <defs>
          {/* Subtle soft background */}
          <radialGradient id="oceanGlow" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#F1F5F9" stopOpacity="1" />
          </radialGradient>

          {/* Selected Country Glow Filter */}
          <filter id="countryHighlight" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="#2563eb" floodOpacity="0.4" />
          </filter>
        </defs>

        {/* Ocean Background */}
        <rect width={dimensions.width} height={dimensions.height} fill="url(#oceanGlow)" />

        {/* Map View Group with Pan & Zoom Transform */}
        <g transform={`translate(${transform.x}, ${transform.y}) scale(${transform.k})`}>
          {/* Graticule / Latitude & Longitude Lines */}
          <path
            d={graticulePath}
            fill="none"
            stroke="#CBD5E1"
            strokeWidth="0.5"
            strokeDasharray="2,3"
            opacity="0.5"
          />

          {/* World Countries Paths */}
          {geoData.countries.features.map((feature: any, index: number) => {
            const rawId = feature.id;
            const countryMeta = getCountryById(rawId);
            const pathD = pathGenerator(feature);
            if (!pathD) return null;

            const countryId = countryMeta ? countryMeta.id : rawId?.toString();
            const userState = countryId ? countryStates[countryId] : undefined;
            const isSelected = selectedCountryId === countryId;

            // Check if continent filter is active
            const matchesContinent =
              selectedContinent === 'all' ||
              (countryMeta && countryMeta.continent === selectedContinent);

            // Default mosaic color styling
            let fillColor = userState?.color || '#E2E8F0';
            let strokeColor = '#FFFFFF';
            let strokeWidth = 1.0;
            let opacity = matchesContinent ? 1 : 0.35;

            if (isSelected) {
              strokeColor = '#2563eb';
              strokeWidth = 2.2;
              opacity = 1;
            }

            return (
              <path
                key={`country-${countryId || index}`}
                id={`map-country-${countryId}`}
                d={pathD}
                fill={fillColor}
                stroke={strokeColor}
                strokeWidth={strokeWidth / transform.k}
                strokeLinejoin="round"
                strokeLinecap="round"
                opacity={opacity}
                className="transition-colors duration-150 cursor-pointer outline-none hover:opacity-90"
                style={{
                  filter: isSelected ? 'drop-shadow(0 0 5px rgba(37, 99, 235, 0.45))' : undefined
                }}
                onMouseEnter={(e) => {
                  if (countryMeta) {
                    const rect = containerRef.current?.getBoundingClientRect();
                    if (rect) {
                      setHoveredCountry({
                        country: countryMeta,
                        x: e.clientX - rect.left,
                        y: e.clientY - rect.top
                      });
                    }
                  }
                }}
                onMouseMove={(e) => {
                  if (hoveredCountry && countryMeta) {
                    const rect = containerRef.current?.getBoundingClientRect();
                    if (rect) {
                      setHoveredCountry({
                        country: countryMeta,
                        x: e.clientX - rect.left,
                        y: e.clientY - rect.top
                      });
                    }
                  }
                }}
                onMouseLeave={() => setHoveredCountry(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  if (countryId) {
                    onSelectCountry(countryId);
                  }
                }}
              />
            );
          })}
        </g>
      </svg>

      {/* Floating Hover Tooltip */}
      {hoveredCountry && (
        <div
          className="absolute pointer-events-none z-40 bg-white/95 backdrop-blur-md border border-slate-200 text-slate-800 px-3.5 py-2 rounded-xl shadow-xl transition-transform duration-75 flex items-center space-x-2.5"
          style={{
            left: `${hoveredCountry.x + 16}px`,
            top: `${hoveredCountry.y - 12}px`,
            transform: 'translateY(-50%)'
          }}
        >
          <span className="text-2xl leading-none">{hoveredCountry.country.flag}</span>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-sm text-slate-900">
                {language === 'tr' ? hoveredCountry.country.nameTr : hoveredCountry.country.nameEn}
              </span>
              <span className="text-[10px] font-mono text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                {hoveredCountry.country.iso2}
              </span>
            </div>
            <div className="text-[11px] text-slate-500 flex items-center space-x-1">
              <span>{language === 'tr' ? hoveredCountry.country.continentTr : hoveredCountry.country.continent}</span>
              <span>•</span>
              <span>{language === 'tr' ? hoveredCountry.country.capitalTr : hoveredCountry.country.capitalEn}</span>
            </div>
            {countryStates[hoveredCountry.country.id]?.note && (
              <div className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 mt-1 flex items-center gap-1 font-medium">
                <span>📝</span> {countryStates[hoveredCountry.country.id].note?.slice(0, 30)}...
              </div>
            )}
          </div>
        </div>
      )}

      {/* Clean Minimalism Floating Navigation Card */}
      <div className="absolute bottom-5 left-5 z-20 bg-white/90 backdrop-blur-md border border-slate-200 p-2.5 rounded-xl shadow-sm flex items-center gap-4">
        <div className="flex flex-col">
          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
            {language === 'tr' ? 'Aktif Görünüm' : 'Currently Viewing'}
          </span>
          <span className="text-xs font-semibold text-slate-800">
            {selectedContinent === 'all'
              ? (language === 'tr' ? 'Küresel Mozaik Görünümü' : 'Global Mosaic View')
              : (language === 'tr' ? `${selectedContinent} Görünümü` : `${selectedContinent} View`)}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            id="btn-zoom-in"
            onClick={() => handleZoom('in')}
            className="w-7 h-7 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 transition-colors shadow-xs"
            title={t.zoomIn}
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            id="btn-zoom-out"
            onClick={() => handleZoom('out')}
            className="w-7 h-7 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 transition-colors shadow-xs"
            title={t.zoomOut}
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            id="btn-reset-view"
            onClick={handleReset}
            className="w-7 h-7 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 transition-colors shadow-xs"
            title={t.resetView}
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Subtle Bottom Tip */}
      <div className="absolute bottom-5 right-32 pointer-events-none hidden md:flex items-center space-x-2 text-[11px] text-slate-500 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-200 shadow-xs">
        <Sparkles className="w-3 h-3 text-blue-600" />
        <span>{t.tipClickToSelect}</span>
      </div>
    </div>
  );
};
