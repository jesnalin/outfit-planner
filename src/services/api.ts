import { WardrobeItem, OutfitPlanResult, OutfitOption } from '../types/wardrobe';

export interface AnalyzeImagePayload {
  imageBase64: string;
  mimeType: string;
  userHint?: string;
  existingItems?: WardrobeItem[];
}

export interface AnalyzeImageResponse {
  name: string;
  category: 'top' | 'bottom' | 'dress' | 'shoes' | 'bag' | 'accessory' | 'outerwear';
  subcategory: string;
  color: string;
  pattern: string;
  fabric: string;
  styleTags: string[];
  weatherSuitability: string[];
  occasions: string[];
  isClear: boolean;
  clarificationQuestion?: string;
  addedDescription: string;
  stylingSuggestions: string[];
}

export async function callAnalyzeClothing(payload: AnalyzeImagePayload): Promise<AnalyzeImageResponse> {
  const res = await fetch('/api/analyze-clothing', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Server responded with status ${res.status}`);
  }

  return res.json();
}

export interface PlanOutfitsPayload {
  wardrobe: WardrobeItem[];
  occasion: string;
  weather: string;
  recentlyWornItemIds: string[];
  specificItemId?: string;
  userPrompt?: string;
  allowShoppingRecommendations?: boolean;
}

export async function callPlanOutfits(payload: PlanOutfitsPayload): Promise<OutfitPlanResult> {
  const res = await fetch('/api/plan-outfits', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Server responded with status ${res.status}`);
  }

  const data = await res.json();

  // Populate full image and details from wardrobe for pieces
  const wardrobeMap = new Map<string, WardrobeItem>();
  payload.wardrobe.forEach((item) => wardrobeMap.set(item.id, item));

  const enrichedOutfits: OutfitOption[] = (data.outfits || []).map((outfit: any, idx: number) => {
    const enrichPiece = (piece: any) => {
      if (!piece) return null;
      const matched = wardrobeMap.get(piece.id);
      if (matched) {
        return {
          id: matched.id,
          name: matched.name,
          category: matched.category,
          imageUrl: matched.imageUrl,
        };
      }
      return piece;
    };

    return {
      optionNumber: outfit.optionNumber || idx + 1,
      vibe: outfit.vibe || `Curated Look ${idx + 1}`,
      topItem: enrichPiece(outfit.topItem),
      bottomItem: enrichPiece(outfit.bottomItem),
      shoesItem: enrichPiece(outfit.shoesItem),
      bagItem: enrichPiece(outfit.bagItem),
      accessoriesItem: enrichPiece(outfit.accessoriesItem),
      hair: outfit.hair || 'Natural parted hair',
      stylingTip: outfit.stylingTip || 'Relaxed tuck with neat cuffs',
      whyItWorks: outfit.whyItWorks || 'Balanced color palette and comfortable fabric weight.',
    };
  });

  return {
    outfits: enrichedOutfits,
    mostPracticalRecommendation: data.mostPracticalRecommendation || '',
    formattedResponse: data.formattedResponse || '',
    occasion: payload.occasion,
    weather: payload.weather,
    createdAt: new Date().toISOString(),
  };
}
