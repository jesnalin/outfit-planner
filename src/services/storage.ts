import { WardrobeItem, WornHistoryEntry, OutfitOption } from '../types/wardrobe';

const WARDROBE_KEY = 'stylist_wardrobe_items';
const HISTORY_KEY = 'stylist_worn_history';
const FAVORITES_KEY = 'stylist_favorite_outfits';

export function getStoredWardrobe(): WardrobeItem[] {
  try {
    const raw = localStorage.getItem(WARDROBE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse stored wardrobe:', err);
    return [];
  }
}

export function saveStoredWardrobe(items: WardrobeItem[]): void {
  try {
    localStorage.setItem(WARDROBE_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('Failed to save wardrobe to localStorage:', err);
  }
}

export function addWardrobeItem(item: WardrobeItem): WardrobeItem[] {
  const current = getStoredWardrobe();
  const updated = [item, ...current];
  saveStoredWardrobe(updated);
  return updated;
}

export function updateWardrobeItem(item: WardrobeItem): WardrobeItem[] {
  const current = getStoredWardrobe();
  const updated = current.map((i) => (i.id === item.id ? item : i));
  saveStoredWardrobe(updated);
  return updated;
}

export function deleteWardrobeItem(id: string): WardrobeItem[] {
  const current = getStoredWardrobe();
  const updated = current.filter((i) => i.id !== id);
  saveStoredWardrobe(updated);
  return updated;
}

export function getStoredHistory(): WornHistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse stored history:', err);
    return [];
  }
}

export function logOutfitWorn(entry: Omit<WornHistoryEntry, 'id'>): {
  history: WornHistoryEntry[];
  wardrobe: WardrobeItem[];
} {
  const history = getStoredHistory();
  const newEntry: WornHistoryEntry = {
    ...entry,
    id: 'entry-' + Date.now(),
  };
  const updatedHistory = [newEntry, ...history];
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));

  // Update wardrobe item wear counts and last worn dates
  const wardrobe = getStoredWardrobe();
  const todayStr = entry.date;
  const updatedWardrobe = wardrobe.map((item) => {
    if (entry.itemIds.includes(item.id)) {
      return {
        ...item,
        timesWorn: (item.timesWorn || 0) + 1,
        lastWornDate: todayStr,
      };
    }
    return item;
  });
  saveStoredWardrobe(updatedWardrobe);

  return { history: updatedHistory, wardrobe: updatedWardrobe };
}

export function getRecentlyWornItemIds(daysBack = 3): string[] {
  const history = getStoredHistory();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - daysBack);
  const cutoffStr = cutoff.toISOString().split('T')[0];

  const recent = history.filter((h) => h.date >= cutoffStr);
  const ids = new Set<string>();
  recent.forEach((r) => r.itemIds.forEach((id) => ids.add(id)));
  return Array.from(ids);
}
