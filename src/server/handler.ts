import { analyzeClothingItem, planOutfits, WardrobeItem } from './geminiService';

export async function handleApiRequest(
  urlPath: string,
  method: string,
  body: any
): Promise<{ status: number; data: any }> {
  try {
    if (urlPath === '/api/analyze-clothing' && method === 'POST') {
      const { imageBase64, mimeType, userHint, existingItems } = body || {};
      if (!imageBase64) {
        return { status: 400, data: { error: 'imageBase64 is required' } };
      }
      const result = await analyzeClothingItem(imageBase64, mimeType, userHint, existingItems);
      return { status: 200, data: result };
    }

    if (urlPath === '/api/plan-outfits' && method === 'POST') {
      const {
        wardrobe,
        occasion,
        weather,
        recentlyWornItemIds,
        specificItemId,
        userPrompt,
        allowShoppingRecommendations,
      } = body || {};

      if (!Array.isArray(wardrobe)) {
        return { status: 400, data: { error: 'wardrobe array is required' } };
      }

      const result = await planOutfits({
        wardrobe,
        occasion,
        weather,
        recentlyWornItemIds,
        specificItemId,
        userPrompt,
        allowShoppingRecommendations,
      });

      return { status: 200, data: result };
    }

    if (urlPath === '/api/health' && method === 'GET') {
      return { status: 200, data: { status: 'ok', time: new Date().toISOString() } };
    }

    return { status: 404, data: { error: 'API route not found' } };
  } catch (error: any) {
    console.error(`API Error on ${urlPath}:`, error);
    return { status: 500, data: { error: error.message || 'Internal server error' } };
  }
}
