import * as topojson from 'topojson-client';
import countries110m from 'world-atlas/countries-110m.json';
import { FeatureCollection, Geometry } from 'geojson';

export interface WorldGeoData {
  countries: FeatureCollection<Geometry>;
  land: Geometry;
}

let cachedGeoData: WorldGeoData | null = null;

export function getWorldGeoData(): WorldGeoData {
  if (cachedGeoData) return cachedGeoData;

  // Extract features from topojson
  // TopoJSON type casting
  const topology = countries110m as any;
  const countries = topojson.feature(topology, topology.objects.countries) as unknown as FeatureCollection<Geometry>;
  const land = topojson.feature(topology, topology.objects.land) as unknown as Geometry;

  cachedGeoData = {
    countries,
    land
  };

  return cachedGeoData;
}
