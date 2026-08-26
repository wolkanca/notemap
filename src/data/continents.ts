import { ContinentInfo } from '../types/country';

export const CONTINENTS: ContinentInfo[] = [
  { id: 'all', nameTr: 'Tüm Dünya', nameEn: 'All World', center: [0, 20], zoom: 1 },
  { id: 'Europe', nameTr: 'Avrupa', nameEn: 'Europe', center: [15, 54], zoom: 3.5 },
  { id: 'Asia', nameTr: 'Asya', nameEn: 'Asia', center: [90, 45], zoom: 2.2 },
  { id: 'Africa', nameTr: 'Afrika', nameEn: 'Africa', center: [20, 3], zoom: 2.2 },
  { id: 'North America', nameTr: 'Kuzey Amerika', nameEn: 'North America', center: [-100, 45], zoom: 2.1 },
  { id: 'South America', nameTr: 'Güney Amerika', nameEn: 'South America', center: [-60, -22], zoom: 2.3 },
  { id: 'Oceania', nameTr: 'Okyanusya', nameEn: 'Oceania', center: [135, -25], zoom: 2.5 },
  { id: 'Antarctica', nameTr: 'Antarktika', nameEn: 'Antarctica', center: [0, -80], zoom: 2 }
];
