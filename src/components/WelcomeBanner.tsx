import React from 'react';
import { Camera, Sparkles, Wand2, ArrowRight } from 'lucide-react';

interface WelcomeBannerProps {
  onOpenUpload: () => void;
  onLoadSample: () => void;
  wardrobeCount: number;
}

export const WelcomeBanner: React.FC<WelcomeBannerProps> = ({
  onOpenUpload,
  onLoadSample,
  wardrobeCount,
}) => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-stone-900 text-stone-100 p-8 md:p-12 mb-10 shadow-xl border border-stone-800">
      {/* Editorial aesthetic background watermark */}
      <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 select-none pointer-events-none opacity-5 font-serif text-[180px] font-bold text-white leading-none">
        CHIC
      </div>

      <div className="relative z-10 max-w-3xl">
        <div className="inline-flex items-center space-x-2 bg-stone-800/90 text-stone-300 text-xs px-3.5 py-1.5 rounded-full font-medium tracking-wider uppercase mb-5 border border-stone-700/60">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Your Personal Stylist & Wardrobe Archivist</span>
        </div>

        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-[1.15] mb-4">
          Welcome to your Daily Outfit Planner & Stylist
        </h1>

        <div className="space-y-3 text-stone-300 text-sm sm:text-base leading-relaxed font-normal mb-8">
          <p className="font-medium text-stone-200">
            👋 <strong>Please start by uploading photos of your wardrobe pieces!</strong>
          </p>
          <p>
            Upload your tops, shirts, T-shirts, jeans, trousers, skirts, dresses, jackets, shoes, bags, and accessories.
            I will analyze each item's color, pattern, fabric, and style to build your digital closet.
          </p>
          <p className="text-stone-400 text-xs sm:text-sm">
            ✨ When you ask <em>“What should I wear today?”</em>, I will formulate practical, wearable outfit combinations using <strong>ONLY</strong> the clothing items you actually own.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onOpenUpload}
            className="flex items-center space-x-2 bg-white hover:bg-stone-100 text-stone-900 font-semibold px-6 py-3.5 rounded-full text-sm transition shadow-lg hover:shadow-xl transform active:scale-95"
          >
            <Camera className="w-4 h-4 text-stone-900" />
            <span>Upload Wardrobe Photos</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>

          {wardrobeCount === 0 && (
            <button
              onClick={onLoadSample}
              className="flex items-center space-x-2 bg-stone-800 hover:bg-stone-700 text-stone-200 font-medium px-5 py-3.5 rounded-full text-sm transition border border-stone-700"
            >
              <Wand2 className="w-4 h-4 text-amber-400" />
              <span>Explore Starter Wardrobe (14 pieces)</span>
            </button>
          )}

          {wardrobeCount > 0 && (
            <div className="text-xs text-stone-400 ml-2">
              Currently indexing <span className="text-white font-semibold">{wardrobeCount} items</span> in your closet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
