export type Language = 'tr' | 'en';

export type CountryStatus = 'unvisited' | 'planned' | 'visited' | 'favorite' | 'researching' | 'work';

export interface CountryMetadata {
  id: string; // Numeric ISO id as string ("792", "840", etc.)
  iso2: string; // "TR", "US", "DE"
  iso3: string; // "TUR", "USA", "DEU"
  nameTr: string;
  nameEn: string;
  continent: 'Europe' | 'Asia' | 'Africa' | 'North America' | 'South America' | 'Oceania' | 'Antarctica';
  continentTr: string;
  flag: string;
  capitalTr: string;
  capitalEn: string;
}

export interface UserCountryState {
  countryId: string;
  color?: string;
  note?: string;
  status?: CountryStatus;
  tags?: string[];
  updatedAt?: string;
}

export interface ColorOption {
  id: string;
  hex: string;
  nameTr: string;
  nameEn: string;
  bgClass?: string;
  borderClass?: string;
}

export interface ContinentInfo {
  id: string;
  nameTr: string;
  nameEn: string;
  center: [number, number]; // [longitude, latitude]
  zoom: number;
}
