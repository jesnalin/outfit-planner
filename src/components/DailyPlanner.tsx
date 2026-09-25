import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  CloudSun,
  MapPin,
  Calendar,
  Layers,
  Loader2,
  Copy,
  Check,
  Send,
  HelpCircle,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Shirt,
  Compass,
} from 'lucide-react';
import {
  WardrobeItem,
  OutfitPlanResult,
  OutfitOption,
} from '../types/wardrobe';
import { callPlanOutfits } from '../services/api';
import { OutfitCard } from './OutfitCard';

interface DailyPlannerProps {
  wardrobe: WardrobeItem[];
  recentlyWornItemIds: string[];
  initialSpecificItemId?: string | null;
  onClearSpecificItem?: () => void;
  onWearOutfit: (outfit: OutfitOption, occasion: string, weather: string) => void;
  onOpenUpload: () => void;
}

const OCCASIONS = [
  'Everyday wear',
  'College',
  'Casual outing',
  'Friends/family gathering',
  'Presentation/interview',
  'Party',
  'Festive events',
  'Travel',
];

const WEATHER_PRESETS = [
  { label: 'Mild & Pleasant (22°C)', desc: 'Comfortable everyday dressing', value: 'Mild & Pleasant (22°C)' },
  { label: 'Hot & Sunny (32°C)', desc: 'Prioritize breathable fabrics', value: 'Hot & Sunny (32°C)' },
  { label: 'Rainy & Wet', desc: 'Practical footwear & puddle-safe cuts', value: 'Rainy & Wet (Monsoon/Showers)' },
  { label: 'Cool & Crisp (15°C)', desc: 'Light layering & knitwear', value: 'Cool & Crisp (15°C)' },
  { label: 'Cold / Chilly (8°C)', desc: 'Cozy outerwear & structured layers', value: 'Cold & Chilly (8°C)' },
  { label: 'Humid & Breezy', desc: 'Loose, airy silhouettes', value: 'Humid & Warm' },
];

export const DailyPlanner: React.FC<DailyPlannerProps> = ({
  wardrobe,
  recentlyWornItemIds,
  initialSpecificItemId,
  onClearSpecificItem,
  onWearOutfit,
  onOpenUpload,
}) => {
  const [selectedOccasion, setSelectedOccasion] = useState('Casual outing');
  const [customOccasion, setCustomOccasion] = useState('');
  const [selectedWeather, setSelectedWeather] = useState('Mild & Pleasant (22°C)');
  const [customWeather, setCustomWeather] = useState('');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(initialSpecificItemId || null);
  const [userPrompt, setUserPrompt] = useState('What should I wear today?');
  const [allowShopping, setAllowShopping] = useState(false);

  // Results
  const [isPlanning, setIsPlanning] = useState(false);
  const [planResult, setPlanResult] = useState<OutfitPlanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  // Sync if initialSpecificItemId prop changes
  useEffect(() => {
    if (initialSpecificItemId) {
      setSelectedItemId(initialSpecificItemId);
      const target = wardrobe.find((w) => w.id === initialSpecificItemId);
      if (target) {
        setUserPrompt(`Style this ${target.color} ${target.name} for me`);
      }
    }
  }, [initialSpecificItemId, wardrobe]);

  const targetItem = selectedItemId ? wardrobe.find((w) => w.id === selectedItemId) : null;

  const effectiveOccasion = customOccasion.trim() || selectedOccasion;
  const effectiveWeather = customWeather.trim() || selectedWeather;

  const handlePlanOutfits = async () => {
    if (wardrobe.length === 0) {
      setError('Your wardrobe is currently empty. Please upload some clothes first!');
      return;
    }

    setIsPlanning(true);
    setError(null);

    try {
      const result = await callPlanOutfits({
        wardrobe,
        occasion: effectiveOccasion,
        weather: effectiveWeather,
        recentlyWornItemIds,
        specificItemId: selectedItemId || undefined,
        userPrompt: userPrompt.trim(),
        allowShoppingRecommendations: allowShopping,
      });

      setPlanResult(result);
    } catch (err: any) {
      console.error('Outfit planning error:', err);
      setError(err.message || 'Failed to curate outfits. Please try again.');
    } finally {
      setIsPlanning(false);
    }
  };

  const handleCopyFormattedText = () => {
    if (!planResult) return;
    navigator.clipboard.writeText(planResult.formattedResponse);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Planner Controls Card */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 md:p-8 shadow-sm space-y-6">
        <div>
          <div className="inline-flex items-center space-x-2 text-stone-500 text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>AI Wardrobe Concierge</span>
          </div>
          <h2 className="font-serif text-3xl font-bold text-stone-900">
            Daily Outfit Planner
          </h2>
          <p className="text-stone-600 text-sm mt-1">
            Tell me the occasion and weather. I will generate practical, stylish combinations using <strong>ONLY</strong> your uploaded clothes, rotating pieces to keep your looks fresh.
          </p>
        </div>

        {/* Target Item Pill (if styling a specific item) */}
        {targetItem && (
          <div className="bg-stone-900 text-white rounded-2xl p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-stone-800 shrink-0">
                <img
                  src={targetItem.imageUrl}
                  alt={targetItem.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-amber-400">
                  Styling Focus Item
                </div>
                <div className="font-serif font-bold text-base leading-tight">
                  {targetItem.name}
                </div>
                <div className="text-xs text-stone-300">
                  {targetItem.color} · {targetItem.fabric}
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setSelectedItemId(null);
                if (onClearSpecificItem) onClearSpecificItem();
              }}
              className="text-xs bg-stone-800 hover:bg-stone-700 text-stone-300 px-3 py-1.5 rounded-full transition"
            >
              Clear Focus
            </button>
          </div>
        )}

        {/* Occasion Selection */}
        <div className="space-y-2.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
            1. Select Occasion
          </label>
          <div className="flex flex-wrap gap-2">
            {OCCASIONS.map((occ) => {
              const isSelected = selectedOccasion === occ && !customOccasion;
              return (
                <button
                  key={occ}
                  onClick={() => {
                    setSelectedOccasion(occ);
                    setCustomOccasion('');
                  }}
                  className={`px-3.5 py-2 rounded-full text-xs font-medium transition ${
                    isSelected
                      ? 'bg-stone-900 text-white shadow-sm'
                      : 'bg-stone-50 text-stone-700 hover:bg-stone-100 border border-stone-200'
                  }`}
                >
                  {occ}
                </button>
              );
            })}
          </div>

          <input
            type="text"
            value={customOccasion}
            onChange={(e) => setCustomOccasion(e.target.value)}
            placeholder="Or type custom occasion (e.g., Art gallery opening, Rainy campus walk, Brunch)..."
            className="w-full px-4 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900"
          />
        </div>

        {/* Weather Selection */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
              2. Weather & Comfort
            </label>
            <span className="text-[11px] text-stone-400">
              Adapts fabrics & shoe practicality
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {WEATHER_PRESETS.map((w) => {
              const isSelected = selectedWeather === w.value && !customWeather;
              return (
                <button
                  key={w.label}
                  onClick={() => {
                    setSelectedWeather(w.value);
                    setCustomWeather('');
                  }}
                  className={`p-3 rounded-2xl text-left border transition ${
                    isSelected
                      ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
                      : 'bg-stone-50 text-stone-800 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  <div className="text-xs font-bold leading-tight">{w.label}</div>
                  <div
                    className={`text-[10px] mt-0.5 line-clamp-1 ${
                      isSelected ? 'text-stone-300' : 'text-stone-500'
                    }`}
                  >
                    {w.desc}
                  </div>
                </button>
              );
            })}
          </div>

          <input
            type="text"
            value={customWeather}
            onChange={(e) => setCustomWeather(e.target.value)}
            placeholder="Or type custom location / weather (e.g., 28°C humid with sudden evening showers)..."
            className="w-full px-4 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900"
          />
        </div>

        {/* Specific Request or Prompt Input */}
        <div className="space-y-2.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
            3. Prompt or Specific Instructions
          </label>
          <div className="relative">
            <input
              type="text"
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              placeholder="e.g., What should I wear today? Keep it comfortable for lots of walking."
              className="w-full pl-4 pr-12 py-3 rounded-2xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900"
            />
          </div>

          {/* Quick Prompt Chips */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {[
              'What should I wear today?',
              'College Day — comfortable & relaxed',
              'Presentation / Interview — smart & polished',
              'Rainy day — keep footwear practical',
              'Festive / Gathering look',
            ].map((chip) => (
              <button
                key={chip}
                onClick={() => setUserPrompt(chip)}
                className="text-[11px] bg-stone-100 hover:bg-stone-200 text-stone-700 px-3 py-1 rounded-full transition"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        {/* Rotation & Shopping Rules Notice */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs border-t border-stone-100">
          <div className="flex items-center space-x-2 text-stone-500">
            <RotateCcw className="w-3.5 h-3.5 text-stone-400" />
            <span>
              {recentlyWornItemIds.length > 0
                ? `Rotating away from ${recentlyWornItemIds.length} recently worn pieces`
                : 'All wardrobe pieces available for rotation'}
            </span>
          </div>

          <label className="inline-flex items-center space-x-2 text-stone-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={allowShopping}
              onChange={(e) => setAllowShopping(e.target.checked)}
              className="rounded border-stone-300 text-stone-900 focus:ring-stone-900"
            />
            <span className="text-[11px]">
              Allow shopping recommendations (Default: ONLY owned clothes)
            </span>
          </label>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={handlePlanOutfits}
          disabled={isPlanning || wardrobe.length === 0}
          className="w-full flex items-center justify-center space-x-2 bg-stone-900 hover:bg-stone-800 text-white font-medium py-4 rounded-full text-sm transition shadow-md disabled:opacity-50"
        >
          {isPlanning ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-stone-300" />
              <span>Analyzing wardrobe silhouettes, weather & rotation...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Curate Today's Outfit Options</span>
            </>
          )}
        </button>
      </div>

      {/* Empty Wardrobe Notice */}
      {wardrobe.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 text-center space-y-3">
          <Shirt className="w-10 h-10 text-amber-700 mx-auto" />
          <h3 className="font-serif text-lg font-bold text-amber-950">
            No Clothes in Wardrobe Yet
          </h3>
          <p className="text-xs text-amber-800 max-w-md mx-auto">
            Please upload photos of your tops, bottoms, shoes, and accessories so I can plan outfits using your actual pieces.
          </p>
          <button
            onClick={onOpenUpload}
            className="bg-amber-900 hover:bg-amber-800 text-white text-xs font-semibold px-5 py-2.5 rounded-full transition"
          >
            Upload Wardrobe Photos
          </button>
        </div>
      )}

      {/* Results Section */}
      {planResult && (
        <div className="space-y-8 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-amber-600 mb-1 flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Curated Results</span>
              </div>
              <h3 className="font-serif text-3xl font-bold text-stone-900">
                👗 TODAY'S OUTFIT OPTIONS
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Tailored for: <strong className="text-stone-800">{planResult.occasion}</strong> · Weather: <strong className="text-stone-800">{planResult.weather}</strong>
              </p>
            </div>

            <button
              onClick={handleCopyFormattedText}
              className="inline-flex items-center space-x-2 text-xs font-medium bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 px-4 py-2 rounded-full transition shadow-sm self-start sm:self-auto"
            >
              {copiedAll ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied Entire Plan!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Formatted Text</span>
                </>
              )}
            </button>
          </div>

          {/* Render Visual Outfit Cards */}
          <div className="space-y-6">
            {planResult.outfits.map((outfit) => (
              <OutfitCard
                key={outfit.optionNumber}
                outfit={outfit}
                wardrobe={wardrobe}
                onWearOutfit={(o) => onWearOutfit(o, planResult.occasion, planResult.weather)}
              />
            ))}
          </div>

          {/* End Most Practical Recommendation */}
          {planResult.mostPracticalRecommendation && (
            <div className="bg-stone-900 text-white rounded-3xl p-6 sm:p-8 shadow-lg border border-stone-800 space-y-3">
              <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                <Compass className="w-4 h-4" />
                <span>Stylist Verdict & Practicality Recommendation</span>
              </div>

              <p className="text-stone-200 text-sm sm:text-base leading-relaxed font-normal">
                {planResult.mostPracticalRecommendation}
              </p>

              <div className="text-[11px] text-stone-400 pt-1 border-t border-stone-800">
                💡 Selected based on comfort, climate suitability, and occasion practicality from your owned pieces.
              </div>
            </div>
          )}

          {/* Raw Formatted Text Accordion / Collapsible */}
          <details className="bg-stone-100 rounded-2xl p-4 border border-stone-200 text-xs">
            <summary className="font-semibold text-stone-700 cursor-pointer select-none">
              View Raw Formatted Text Response
            </summary>
            <pre className="mt-3 p-4 bg-white rounded-xl border border-stone-200 overflow-x-auto text-[11px] font-mono leading-relaxed text-stone-800 whitespace-pre-wrap">
              {planResult.formattedResponse}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
};
