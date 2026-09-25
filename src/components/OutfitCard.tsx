import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle,
  Copy,
  Check,
  Scissors,
  Bookmark,
  Shirt,
  Wind,
} from 'lucide-react';
import { OutfitOption, WardrobeItem } from '../types/wardrobe';

interface OutfitCardProps {
  outfit: OutfitOption;
  wardrobe: WardrobeItem[];
  onWearOutfit: (outfit: OutfitOption) => void;
  isRecentlyWorn?: boolean;
}

export const OutfitCard: React.FC<OutfitCardProps> = ({
  outfit,
  wardrobe,
  onWearOutfit,
  isRecentlyWorn = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [justWorn, setJustWorn] = useState(false);

  // Helper to retrieve full item metadata if available
  const findItem = (id?: string) => {
    if (!id) return null;
    return wardrobe.find((w) => w.id === id) || null;
  };

  const top = findItem(outfit.topItem?.id);
  const bottom = findItem(outfit.bottomItem?.id);
  const shoes = findItem(outfit.shoesItem?.id);
  const bag = findItem(outfit.bagItem?.id);
  const accessories = findItem(outfit.accessoriesItem?.id);

  // Build items array for flat-lay view
  const pieces = [
    { label: '👚 Top / Base', item: top, fallbackName: outfit.topItem?.name },
    { label: '👖 Bottom / Dress', item: bottom, fallbackName: outfit.bottomItem?.name },
    { label: '👟 Footwear', item: shoes, fallbackName: outfit.shoesItem?.name },
    { label: '👜 Bag', item: bag, fallbackName: outfit.bagItem?.name },
    { label: '💍 Accessories', item: accessories, fallbackName: outfit.accessoriesItem?.name },
  ].filter((p) => p.fallbackName && !p.fallbackName.toLowerCase().includes('n/a') && !p.fallbackName.toLowerCase().includes('none'));

  const handleCopy = () => {
    const text = `Option ${outfit.optionNumber} — [${outfit.vibe}]
👚 Top: ${outfit.topItem?.name || 'N/A'}
👖 Bottom: ${outfit.bottomItem?.name || 'N/A'}
👟 Shoes: ${outfit.shoesItem?.name || 'None'}
👜 Bag: ${outfit.bagItem?.name || 'None'}
💍 Accessories: ${outfit.accessoriesItem?.name || 'None'}
💇 Hair: ${outfit.hair}
✨ Styling tip: ${outfit.stylingTip}

Why it works: ${outfit.whyItWorks}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWear = () => {
    onWearOutfit(outfit);
    setJustWorn(true);
    setTimeout(() => setJustWorn(false), 3000);
  };

  return (
    <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition">
      {/* Card Header with Vibe */}
      <div className="bg-stone-50 border-b border-stone-200/80 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="w-7 h-7 rounded-full bg-stone-900 text-white flex items-center justify-center font-bold text-xs">
            {outfit.optionNumber}
          </span>
          <div>
            <div className="text-[10px] uppercase font-bold tracking-widest text-stone-500">
              Option {outfit.optionNumber}
            </div>
            <h3 className="font-serif text-xl font-bold text-stone-900">
              {outfit.vibe}
            </h3>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopy}
            className="flex items-center space-x-1 text-xs text-stone-600 hover:text-stone-900 bg-white border border-stone-200 px-3 py-1.5 rounded-full transition"
            title="Copy this outfit"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-medium">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>

          <button
            onClick={handleWear}
            className={`flex items-center space-x-1.5 text-xs font-semibold px-4 py-1.5 rounded-full transition shadow-sm ${
              justWorn
                ? 'bg-emerald-600 text-white'
                : 'bg-stone-900 hover:bg-stone-800 text-white'
            }`}
          >
            {justWorn ? (
              <>
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Worn Today!</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Wear Today</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Visual Flat-Lay / Outfit Moodboard */}
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-3 flex items-center space-x-1.5">
            <Shirt className="w-3.5 h-3.5" />
            <span>Wardrobe Pieces Assembled</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {pieces.map((piece, idx) => (
              <div
                key={idx}
                className="bg-stone-50 rounded-2xl border border-stone-200/80 p-2 flex flex-col justify-between overflow-hidden group"
              >
                <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-stone-200 mb-2">
                  {piece.item?.imageUrl ? (
                    <img
                      src={piece.item.imageUrl}
                      alt={piece.fallbackName}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-2 text-stone-400 bg-stone-100 text-center">
                      <Shirt className="w-6 h-6 mb-1 opacity-50" />
                      <span className="text-[10px] leading-tight font-medium">Piece photo</span>
                    </div>
                  )}
                </div>

                <div>
                  <div className="text-[9px] uppercase font-bold text-stone-400 tracking-wider">
                    {piece.label}
                  </div>
                  <div className="text-xs font-semibold text-stone-900 leading-snug line-clamp-2 mt-0.5">
                    {piece.fallbackName}
                  </div>
                  {piece.item?.color && (
                    <div className="text-[10px] text-stone-500 mt-0.5">
                      {piece.item.color}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Structured Output Details matching exact user requirements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-stone-50/70 rounded-2xl p-4 border border-stone-200/70 text-xs">
          <div className="space-y-2.5">
            <div className="flex items-start space-x-2">
              <span className="font-bold text-stone-900 shrink-0 w-28">👚 Top:</span>
              <span className="text-stone-800">{outfit.topItem?.name || 'N/A'}</span>
            </div>

            <div className="flex items-start space-x-2">
              <span className="font-bold text-stone-900 shrink-0 w-28">👖 Bottom:</span>
              <span className="text-stone-800">{outfit.bottomItem?.name || 'N/A'}</span>
            </div>

            <div className="flex items-start space-x-2">
              <span className="font-bold text-stone-900 shrink-0 w-28">👟 Shoes:</span>
              <span className="text-stone-800">{outfit.shoesItem?.name || 'None owned yet'}</span>
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-start space-x-2">
              <span className="font-bold text-stone-900 shrink-0 w-28">👜 Bag:</span>
              <span className="text-stone-800">{outfit.bagItem?.name || 'None owned yet'}</span>
            </div>

            <div className="flex items-start space-x-2">
              <span className="font-bold text-stone-900 shrink-0 w-28">💍 Accessories:</span>
              <span className="text-stone-800">{outfit.accessoriesItem?.name || 'None owned yet'}</span>
            </div>

            <div className="flex items-start space-x-2">
              <span className="font-bold text-stone-900 shrink-0 w-28">💇 Hair:</span>
              <span className="text-stone-800">{outfit.hair}</span>
            </div>
          </div>
        </div>

        {/* Styling Tip */}
        {outfit.stylingTip && (
          <div className="flex items-start space-x-2 text-xs bg-amber-50/70 border border-amber-200/70 p-3.5 rounded-xl text-stone-800">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-900">✨ Styling tip: </span>
              <span>{outfit.stylingTip}</span>
            </div>
          </div>
        )}

        {/* Why it works */}
        <div className="p-3.5 rounded-xl bg-white border border-stone-200 text-xs leading-relaxed text-stone-700">
          <span className="font-bold text-stone-900">Why it works: </span>
          <span>{outfit.whyItWorks}</span>
        </div>
      </div>
    </div>
  );
};
