import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY not set in environment.');
  }
  return new GoogleGenAI({ apiKey: apiKey || '' });
}

export interface WardrobeItem {
  id: string;
  name: string;
  category: 'top' | 'bottom' | 'dress' | 'shoes' | 'bag' | 'accessory' | 'outerwear';
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

export interface AnalyzedItemResult {
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

export interface OutfitOption {
  optionNumber: number;
  vibe: string;
  topItem?: { id: string; name: string };
  bottomItem?: { id: string; name: string };
  shoesItem?: { id: string; name: string };
  bagItem?: { id: string; name: string };
  accessoriesItem?: { id: string; name: string };
  hair: string;
  stylingTip: string;
  whyItWorks: string;
  rawText?: string;
}

export interface OutfitPlanResponse {
  outfits: OutfitOption[];
  mostPracticalRecommendation: string;
  formattedResponse: string;
}

export async function analyzeClothingItem(imageBase64: string, mimeType: string, userHint?: string, existingItems: WardrobeItem[] = []): Promise<AnalyzedItemResult> {
  const ai = getGenAI();

  // Strip prefix data URL if present
  let cleanBase64 = imageBase64;
  if (cleanBase64.includes('base64,')) {
    cleanBase64 = cleanBase64.split('base64,')[1];
  }

  const prompt = `You are a personal Wardrobe Stylist and digital closet archivist.
Analyze this photo of an actual clothing or accessory piece.

Your tasks:
1. Identify exactly what the item is.
2. Note its primary color, pattern (e.g., solid, floral, striped, checked, graphic), fabric/appearance (e.g., crisp poplin cotton, washed denim, rib knit, silk satin, linen, chunky cable knit, smooth leather, canvas), and overall style (e.g., casual, minimal, smart casual, preppy, streetwear, bohemian, festive).
3. Assign its category: must be one of ["top", "bottom", "dress", "shoes", "bag", "accessory", "outerwear"].
4. Assess if the image is clear enough to identify. If unclear, blurry, or ambiguous (e.g., hard to tell if it's a skirt or culottes, or top vs dress), set "isClear": false and provide a polite "clarificationQuestion" for the user.
5. Create a clean description for the confirmation: "Added to wardrobe: [item description]." (e.g. "Added to wardrobe: Oversized cream cable-knit wool sweater.")
6. Based on existing wardrobe pieces (if any are listed below), or realistic styling rules, suggest 2–3 ways the user can style this specific item.

Existing wardrobe pieces for context:
${existingItems.length > 0 ? existingItems.map(i => `- [${i.id}] ${i.name} (${i.category}, ${i.color}, ${i.fabric})`).join('\n') : 'No other items uploaded yet.'}

${userHint ? `User notes about this item: "${userHint}"` : ''}

Respond in strict JSON with the following schema:
{
  "name": "Short descriptive name (e.g., Cream Cable-Knit Sweater)",
  "category": "top | bottom | dress | shoes | bag | accessory | outerwear",
  "subcategory": "e.g., Cable knit sweater, High-waist trousers, Ankle boots, etc.",
  "color": "e.g., Cream / Off-white",
  "pattern": "e.g., Cable knit texture / Solid",
  "fabric": "e.g., Wool blend knit",
  "styleTags": ["minimal", "comfy", "smart casual", "autumn"],
  "weatherSuitability": ["cool", "cold"],
  "occasions": ["everyday", "college", "casual outing", "friends/family gathering"],
  "isClear": true,
  "clarificationQuestion": null,
  "addedDescription": "Added to wardrobe: Cream cable-knit wool blend sweater.",
  "stylingSuggestions": [
    "Style 1: ...",
    "Style 2: ...",
    "Style 3: ..."
  ]
}`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      {
        role: 'user',
        parts: [
          {
            inlineData: {
              mimeType: mimeType || 'image/jpeg',
              data: cleanBase64,
            },
          },
          { text: prompt },
        ],
      },
    ],
    config: {
      responseMimeType: 'application/json',
      temperature: 0.2,
    },
  });

  const text = response.text || '{}';
  try {
    const data = JSON.parse(text);
    return {
      name: data.name || 'Wardrobe Item',
      category: data.category || 'top',
      subcategory: data.subcategory || '',
      color: data.color || 'Neutral',
      pattern: data.pattern || 'Solid',
      fabric: data.fabric || 'Unknown fabric',
      styleTags: Array.isArray(data.styleTags) ? data.styleTags : ['casual'],
      weatherSuitability: Array.isArray(data.weatherSuitability) ? data.weatherSuitability : ['all-season'],
      occasions: Array.isArray(data.occasions) ? data.occasions : ['casual outing'],
      isClear: data.isClear !== false,
      clarificationQuestion: data.clarificationQuestion || undefined,
      addedDescription: data.addedDescription || `Added to wardrobe: ${data.name || 'item'}.`,
      stylingSuggestions: Array.isArray(data.stylingSuggestions) && data.stylingSuggestions.length > 0
        ? data.stylingSuggestions
        : ['Style with neutral basics for a relaxed everyday outfit.'],
    };
  } catch (err) {
    console.error('Failed to parse Gemini response for clothing analysis:', err, text);
    throw new Error('Failed to analyze clothing image.');
  }
}

export async function planOutfits(params: {
  wardrobe: WardrobeItem[];
  occasion?: string;
  weather?: string;
  recentlyWornItemIds?: string[];
  specificItemId?: string;
  userPrompt?: string;
  allowShoppingRecommendations?: boolean;
}): Promise<OutfitPlanResponse> {
  const { wardrobe, occasion = 'Casual outing', weather = 'Mild / Pleasant', recentlyWornItemIds = [], specificItemId, userPrompt, allowShoppingRecommendations = false } = params;

  const ai = getGenAI();

  if (wardrobe.length === 0) {
    return {
      outfits: [],
      mostPracticalRecommendation: 'Please upload photos of your wardrobe pieces first so I can plan outfits using your actual clothes!',
      formattedResponse: 'Please upload photos of your clothing pieces (tops, bottoms, dresses, jackets, shoes, bags, accessories) to begin.',
    };
  }

  // Filter or highlight specific item
  const targetItem = specificItemId ? wardrobe.find(w => w.id === specificItemId) : null;

  const wardrobeInventory = wardrobe.map(w => ({
    id: w.id,
    name: w.name,
    category: w.category,
    subcategory: w.subcategory,
    color: w.color,
    pattern: w.pattern,
    fabric: w.fabric,
    styleTags: w.styleTags,
    occasions: w.occasions,
    weatherSuitability: w.weatherSuitability,
    recentlyWorn: recentlyWornItemIds.includes(w.id),
    timesWorn: w.timesWorn || 0,
  }));

  const systemInstructions = `You are a high-end personal Daily Outfit Planner and Wardrobe Stylist.

CRITICAL RULES:
1. ONLY USE THE CLOTHING ITEMS PROVIDED IN THE USER'S WARDROBE.
   - Do NOT invent or assume any clothing, shoe, or bag that is not in the wardrobe list.
   - If the user does not own an item for a slot (e.g. no bag uploaded), state: "None in wardrobe (leave empty or carry essentials)" or "Not owned yet".
   ${allowShoppingRecommendations ? 'The user explicitly allowed shopping recommendations, so you may suggest a complementary new piece at the very end as a shopping note.' : 'Do NOT suggest clothing that the user does not own.'}
2. OUTFIT ROTATION:
   - Items marked with "recentlyWorn: true" should be rotated out unless necessary, giving variety by mixing different wardrobe pieces.
3. WEATHER & COMFORT:
   - For hot weather: prioritize breathable, lightweight, comfortable combinations.
   - For rainy weather: suggest practical footwear, avoid trailing long bottoms, ensure protection/layering.
   - For cooler weather: suggest suitable layering using jackets/cardigans/sweaters in wardrobe.
4. OCCASION:
   - Strictly tailor outfits for the requested occasion: ${occasion}.
5. SPECIFIC ITEM:
   ${targetItem ? `The user specifically asked to style: "${targetItem.name}" (${targetItem.color} ${targetItem.category}). Every option MUST incorporate this item ([${targetItem.id}])!` : 'Create balanced, versatile daily outfit choices.'}
6. EXPLAIN WHY IT WORKS:
   - Explain why the pieces work together based on color coordination, patterns, overall style, occasion, and practicality. Keep recommendations realistic and wearable.
7. AT THE END:
   - Conclude by stating which option is the most practical for the occasion based on the provided information, without assuming anything about the user's body or appearance.

MANDATORY RESPONSE FORMAT:
The response must contain:
1. "outfits": Array of 2–4 outfit options, each containing:
   - optionNumber (1, 2, 3...)
   - vibe: Short name/vibe (e.g., "Casual & Cute", "College Day", "Minimal", "Smart Casual", "Traditional", "Festive", "Comfy Day", "Clean Editorial", etc.)
   - topItem: { id: "item_id_from_wardrobe", name: "exact name" } (or null if dress is worn)
   - bottomItem: { id: "item_id_from_wardrobe", name: "exact name" } (if dress is worn, bottom can be { id: "dress_id", name: "Dress Name" })
   - shoesItem: { id: "item_id", name: "name" } or null if none
   - bagItem: { id: "item_id", name: "name" } or null if none
   - accessoriesItem: { id: "item_id", name: "name" } or null if none
   - hair: Hair suggestion (e.g., "Sleek low bun", "Natural waves with claw clip", "High ponytail", "Half-up half-down")
   - stylingTip: Optional simple styling/tucking/layering suggestion (e.g., "French tuck the shirt into trousers and roll sleeves to elbows")
   - whyItWorks: 1–2 sentences explaining color harmony, pattern balance, and practicality.
2. "mostPracticalRecommendation": 1–2 sentences naming the most practical option and why.
3. "formattedResponse": The exact textual presentation formatted as:
👗 TODAY'S OUTFIT OPTIONS

Option 1 — [Vibe]
👚 Top: [Item name or None]
👖 Bottom: [Item name]
👟 Shoes: [Item name]
👜 Bag: [Item name]
💍 Accessories: [Item name]
💇 Hair: [Hair suggestion]
✨ Styling tip: [Styling tip]

Why it works: [1–2 sentences]

Option 2 — [Vibe]
...

[Most practical recommendation paragraph]`;

  const userContent = `Here is my current digital wardrobe inventory:
${JSON.stringify(wardrobeInventory, null, 2)}

Occasion: ${occasion}
Current Weather: ${weather}
Recently worn item IDs to rotate away from: ${JSON.stringify(recentlyWornItemIds)}
${targetItem ? `Target Item to Style: ${targetItem.name} (ID: ${targetItem.id})` : ''}
${userPrompt ? `My specific request/note: "${userPrompt}"` : 'Please give me outfit options for today!'}`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      { role: 'user', parts: [{ text: `${systemInstructions}\n\n${userContent}` }] }
    ],
    config: {
      responseMimeType: 'application/json',
      temperature: 0.3,
    },
  });

  const text = response.text || '{}';
  try {
    const data = JSON.parse(text);
    return {
      outfits: Array.isArray(data.outfits) ? data.outfits : [],
      mostPracticalRecommendation: data.mostPracticalRecommendation || '',
      formattedResponse: data.formattedResponse || '',
    };
  } catch (err) {
    console.error('Failed to parse Gemini outfit plan:', err, text);
    throw new Error('Failed to plan outfits.');
  }
}
