import { ColorOption } from '../types/country';

export const PALETTE_COLORS: ColorOption[] = [
  { id: 'red', hex: '#ef4444', nameTr: 'Kırmızı (Gidildi)', nameEn: 'Red (Visited)' },
  { id: 'orange', hex: '#f97316', nameTr: 'Turuncu (Planlanıyor)', nameEn: 'Orange (Planned)' },
  { id: 'yellow', hex: '#eab308', nameTr: 'Sarı (Araştırılıyor)', nameEn: 'Yellow (Researching)' },
  { id: 'green', hex: '#10b981', nameTr: 'Yeşil (Onaylı / Zimmetli)', nameEn: 'Green (Assigned / Active)' },
  { id: 'teal', hex: '#06b6d4', nameTr: 'Turkuaz (Favori)', nameEn: 'Teal (Favorite)' },
  { id: 'blue', hex: '#2563eb', nameTr: 'Mavi (İş / Proje)', nameEn: 'Blue (Work / Project)' },
  { id: 'purple', hex: '#8b5cf6', nameTr: 'Mor (Kültür / Sanat)', nameEn: 'Purple (Culture / Arts)' },
  { id: 'pink', hex: '#ec4899', nameTr: 'Pembe (Hayal Listesi)', nameEn: 'Pink (Bucket List)' },
  { id: 'slate', hex: '#64748b', nameTr: 'Gri (Not Alındı)', nameEn: 'Slate (Noted)' },
];

export const STATUS_PRESETS = [
  { id: 'visited', nameTr: 'Gidildi', nameEn: 'Visited', color: '#ef4444', icon: '📍' },
  { id: 'planned', nameTr: 'Planlanıyor', nameEn: 'Planned', color: '#f97316', icon: '✈️' },
  { id: 'favorite', nameTr: 'Favori', nameEn: 'Favorite', color: '#06b6d4', icon: '⭐' },
  { id: 'researching', nameTr: 'Araştırılıyor', nameEn: 'Researching', color: '#eab308', icon: '🔍' },
  { id: 'work', nameTr: 'İş / Proje', nameEn: 'Work / Project', color: '#2563eb', icon: '💼' },
  { id: 'unvisited', nameTr: 'İşaretsiz', nameEn: 'Unmarked', color: '#cbd5e1', icon: '⚪' },
];
