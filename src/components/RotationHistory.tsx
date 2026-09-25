import React, { useMemo } from 'react';
import {
  CalendarDays,
  RotateCcw,
  Sparkles,
  TrendingUp,
  AlertCircle,
  Shirt,
  Calendar,
  CloudSun,
  MapPin,
} from 'lucide-react';
import { WardrobeItem, WornHistoryEntry } from '../types/wardrobe';

interface RotationHistoryProps {
  wardrobe: WardrobeItem[];
  history: WornHistoryEntry[];
  onStyleItem: (itemId: string) => void;
}

export const RotationHistory: React.FC<RotationHistoryProps> = ({
  wardrobe,
  history,
  onStyleItem,
}) => {
  // Wardrobe items indexed by id
  const wardrobeMap = useMemo(() => {
    const map = new Map<string, WardrobeItem>();
    wardrobe.forEach((w) => map.set(w.id, w));
    return map;
  }, [wardrobe]);

  // Neglected pieces (worn 0 or 1 times)
  const neglectedPieces = useMemo(() => {
    return wardrobe.filter((w) => (w.timesWorn || 0) <= 1).slice(0, 6);
  }, [wardrobe]);

  // Most worn pieces
  const mostWornPieces = useMemo(() => {
    return [...wardrobe]
      .filter((w) => (w.timesWorn || 0) > 1)
      .sort((a, b) => (b.timesWorn || 0) - (a.timesWorn || 0))
      .slice(0, 4);
  }, [wardrobe]);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-2 text-stone-500 text-xs font-semibold uppercase tracking-wider mb-1">
          <RotateCcw className="w-4 h-4" />
          <span>Rotation Intelligence</span>
        </div>
        <h2 className="font-serif text-3xl font-bold text-stone-900">
          Outfit Rotation & OOTD History
        </h2>
        <p className="text-stone-600 text-sm mt-1">
          Track wear frequency to ensure balanced closet rotation. The stylist automatically rests recently worn pieces to guarantee daily variety.
        </p>
      </div>

      {/* Rotation Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Outfits Logged */}
        <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Total Outfits Logged
            </span>
            <CalendarDays className="w-4 h-4 text-stone-400" />
          </div>
          <div className="font-serif text-4xl font-bold text-stone-900">
            {history.length}
          </div>
          <div className="text-xs text-stone-500 mt-2">
            Logged through the "Wear Today" button
          </div>
        </div>

        {/* Rotation Coverage */}
        <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Wardrobe Utilization
            </span>
            <TrendingUp className="w-4 h-4 text-stone-400" />
          </div>
          <div className="font-serif text-4xl font-bold text-stone-900">
            {wardrobe.length > 0
              ? Math.round(
                  (wardrobe.filter((w) => (w.timesWorn || 0) > 0).length /
                    wardrobe.length) *
                    100
                )
              : 0}
            %
          </div>
          <div className="text-xs text-stone-500 mt-2">
            Pieces worn at least once from your collection
          </div>
        </div>

        {/* Rested Items */}
        <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Resting in Cooldown
            </span>
            <RotateCcw className="w-4 h-4 text-amber-500" />
          </div>
          <div className="font-serif text-4xl font-bold text-amber-800">
            {wardrobe.filter((w) => {
              if (!w.lastWornDate) return false;
              const last = new Date(w.lastWornDate).getTime();
              const now = Date.now();
              return now - last < 3 * 24 * 60 * 60 * 1000;
            }).length}
          </div>
          <div className="text-xs text-stone-500 mt-2">
            Items worn within the last 3 days rotated out
          </div>
        </div>
      </div>

      {/* Neglected Pieces Spotlight */}
      {neglectedPieces.length > 0 && (
        <div className="bg-amber-50/60 rounded-3xl border border-amber-200/80 p-6 md:p-8 space-y-4">
          <div className="flex items-center space-x-2 text-amber-900">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <h3 className="font-serif text-xl font-bold">
              Neglected Wardrobe Pieces
            </h3>
          </div>
          <p className="text-xs text-stone-600 max-w-2xl">
            These items have 0 or 1 wears. Maximize your wardrobe investment by styling outfits around them!
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 pt-2">
            {neglectedPieces.map((piece) => (
              <div
                key={piece.id}
                className="bg-white rounded-2xl border border-amber-200/60 p-2.5 flex flex-col justify-between shadow-sm"
              >
                <div className="aspect-[4/5] rounded-xl overflow-hidden bg-stone-100 mb-2">
                  <img
                    src={piece.imageUrl}
                    alt={piece.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-stone-400">
                    {piece.category}
                  </div>
                  <div className="text-xs font-semibold text-stone-900 leading-tight line-clamp-1 mt-0.5">
                    {piece.name}
                  </div>
                </div>
                <button
                  onClick={() => onStyleItem(piece.id)}
                  className="mt-2 w-full flex items-center justify-center space-x-1 bg-stone-900 hover:bg-stone-800 text-white text-[10px] font-medium py-1.5 rounded-lg transition"
                >
                  <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                  <span>Style Now</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* History Log Timeline */}
      <div className="space-y-4">
        <h3 className="font-serif text-2xl font-bold text-stone-900">
          Worn Outfits Log
        </h3>

        {history.length === 0 ? (
          <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center text-stone-500 text-xs">
            <Calendar className="w-8 h-8 mx-auto mb-2 text-stone-300" />
            <p className="font-medium text-stone-800 text-sm">No outfits logged yet</p>
            <p className="mt-1">
              When you choose an outfit in the Daily Planner, click <strong>"Wear Today"</strong> to log it here and keep track of your rotation!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((entry) => {
              const matchedItems = entry.itemIds
                .map((id) => wardrobeMap.get(id))
                .filter(Boolean) as WardrobeItem[];

              return (
                <div
                  key={entry.id}
                  className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center space-x-3 text-xs text-stone-500">
                      <span className="font-bold text-stone-900 bg-stone-100 px-3 py-1 rounded-full">
                        {entry.date}
                      </span>
                      <span>·</span>
                      <span className="flex items-center space-x-1">
                        <MapPin className="w-3.5 h-3.5 text-stone-400" />
                        <span>{entry.occasion}</span>
                      </span>
                      <span>·</span>
                      <span className="flex items-center space-x-1">
                        <CloudSun className="w-3.5 h-3.5 text-stone-400" />
                        <span>{entry.weather}</span>
                      </span>
                    </div>

                    <h4 className="font-serif text-xl font-bold text-stone-900">
                      {entry.outfitVibe}
                    </h4>

                    {entry.stylingTip && (
                      <div className="text-xs text-stone-600 bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                        <span className="font-semibold text-stone-900">✨ Styling tip: </span>
                        <span>{entry.stylingTip}</span>
                      </div>
                    )}
                  </div>

                  {/* Thumbnail Row */}
                  <div className="flex items-center space-x-2 shrink-0 overflow-x-auto pb-1">
                    {matchedItems.map((item) => (
                      <div
                        key={item.id}
                        className="w-16 h-20 rounded-xl overflow-hidden bg-stone-100 border border-stone-200 shrink-0 relative group"
                        title={`${item.name} (${item.color})`}
                      >
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-stone-900/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center p-1 text-[9px] text-white text-center">
                          {item.subcategory || item.name}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
