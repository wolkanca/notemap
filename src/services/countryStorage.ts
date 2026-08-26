import { UserCountryState } from '../types/country';

const STORAGE_KEY = 'world-mosaic-country-state-v1';

export function loadAllCountryStates(): Record<string, UserCountryState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (typeof parsed === 'object' && parsed !== null) {
      return parsed;
    }
    return {};
  } catch (err) {
    console.error('Error loading country states from localStorage:', err);
    return {};
  }
}

export function saveCountryState(countryId: string, state: Partial<UserCountryState>): Record<string, UserCountryState> {
  try {
    const current = loadAllCountryStates();
    const existing = current[countryId] || { countryId };

    const updated: UserCountryState = {
      countryId,
      color: state.color !== undefined ? (state.color || undefined) : existing.color,
      note: state.note !== undefined ? (state.note || undefined) : existing.note,
      status: state.status !== undefined ? (state.status || undefined) : existing.status,
      tags: state.tags !== undefined ? (state.tags || undefined) : existing.tags,
      updatedAt: new Date().toISOString(),
    };

    // If completely empty (no color, no note, no status), we can keep or delete
    if (!updated.color && !updated.note && !updated.status) {
      delete current[countryId];
    } else {
      current[countryId] = updated;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    return current;
  } catch (err) {
    console.error('Error saving country state to localStorage:', err);
    return loadAllCountryStates();
  }
}

export function removeCountryState(countryId: string): Record<string, UserCountryState> {
  try {
    const current = loadAllCountryStates();
    delete current[countryId];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    return current;
  } catch (err) {
    console.error('Error removing country state:', err);
    return loadAllCountryStates();
  }
}

export function exportStatesAsJson(): string {
  const current = loadAllCountryStates();
  return JSON.stringify(current, null, 2);
}

export function importStatesFromJson(jsonString: string): Record<string, UserCountryState> | undefined {
  try {
    const parsed = JSON.parse(jsonString);
    if (typeof parsed === 'object' && parsed !== null) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      return parsed;
    }
    return undefined;
  } catch (err) {
    console.error('Invalid JSON for country states:', err);
    return undefined;
  }
}
