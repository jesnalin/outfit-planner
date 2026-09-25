export type ClothingCategory =
  | 'top'
  | 'bottom'
  | 'dress'
  | 'shoes'
  | 'bag'
  | 'accessory'
  | 'outerwear';

export interface WardrobeItem {
  id: string;
  name: string;
  category: ClothingCategory;
  subcategory: string;
  color: string;
  pattern: string;
  fabric: string;
  styleTags: string[];
  weatherSuitability: string[];
  occasions: string[];
  imageUrl: string;
  dateAdded: string;
  timesWorn: number;
  lastWornDate?: string;
  notes?: string;
}

export interface OutfitPiece {
  id: string;
  name: string;
  category?: ClothingCategory;
  imageUrl?: string;
}

export interface OutfitOption {
  optionNumber: number;
  vibe: string;
  topItem?: OutfitPiece | null;
  bottomItem?: OutfitPiece | null;
  shoesItem?: OutfitPiece | null;
  bagItem?: OutfitPiece | null;
  accessoriesItem?: OutfitPiece | null;
  hair: string;
  stylingTip: string;
  whyItWorks: string;
}

export interface OutfitPlanResult {
  outfits: OutfitOption[];
  mostPracticalRecommendation: string;
  formattedResponse: string;
  occasion: string;
  weather: string;
  createdAt: string;
}

export interface WornHistoryEntry {
  id: string;
  date: string;
  outfitVibe: string;
  itemIds: string[];
  occasion: string;
  weather: string;
  hair?: string;
  stylingTip?: string;
  whyItWorks?: string;
}

export type ActiveTab = 'planner' | 'wardrobe' | 'upload' | 'rotation';
