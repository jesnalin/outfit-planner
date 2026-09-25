import React from 'react';
import { Sparkles, Shirt, UploadCloud, CalendarDays, RefreshCw, Plus } from 'lucide-react';
import { ActiveTab, WardrobeItem } from '../types/wardrobe';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  wardrobe: WardrobeItem[];
  onLoadSample: () => void;
  onClearWardrobe: () => void;
  onOpenUpload: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  wardrobe,
  onLoadSample,
  onClearWardrobe,
  onOpenUpload,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('planner')}>
            <div className="w-10 h-10 rounded-full bg-stone-900 text-stone-100 flex items-center justify-center font-serif text-xl font-bold shadow-sm">
              S
            </div>
            <div>
              <div className="font-serif text-2xl font-bold tracking-tight text-stone-900 leading-none">
                ATELIER STYLIST
              </div>
              <p className="text-[11px] uppercase tracking-widest text-stone-500 font-medium mt-1">
                Daily Outfit Planner & Digital Wardrobe
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-stone-100/80 p-1.5 rounded-full border border-stone-200">
            <button
              onClick={() => setActiveTab('planner')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
                activeTab === 'planner'
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Outfit Planner</span>
            </button>

            <button
              onClick={() => setActiveTab('wardrobe')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
                activeTab === 'wardrobe'
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
              }`}
            >
              <Shirt className="w-3.5 h-3.5" />
              <span>Wardrobe</span>
              <span
                className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  activeTab === 'wardrobe'
                    ? 'bg-stone-700 text-stone-100'
                    : 'bg-stone-200 text-stone-700'
                }`}
              >
                {wardrobe.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('upload')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
                activeTab === 'upload'
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
              }`}
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Add Clothes</span>
            </button>

            <button
              onClick={() => setActiveTab('rotation')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
                activeTab === 'rotation'
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Rotation & History</span>
            </button>
          </nav>

          {/* Quick Actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onOpenUpload}
              className="flex items-center space-x-1.5 bg-stone-900 hover:bg-stone-800 text-white px-3.5 py-2 rounded-full text-xs font-medium tracking-wide transition shadow-sm"
              title="Upload new clothing photos"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Item</span>
            </button>

            <div className="relative group">
              <button
                className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-full border border-stone-200 transition"
                title="Wardrobe options"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-stone-200 py-2 hidden group-hover:block group-focus-within:block z-50">
                <button
                  onClick={onLoadSample}
                  className="w-full text-left px-4 py-2 text-xs text-stone-700 hover:bg-stone-50 font-medium"
                >
                  Load Starter Wardrobe (14 pcs)
                </button>
                {wardrobe.length > 0 && (
                  <button
                    onClick={onClearWardrobe}
                    className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 font-medium"
                  >
                    Clear All Items
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-stone-200 text-xs">
          <button
            onClick={() => setActiveTab('planner')}
            className={`flex flex-col items-center py-1 px-2 ${
              activeTab === 'planner' ? 'text-stone-900 font-bold' : 'text-stone-500'
            }`}
          >
            <Sparkles className="w-4 h-4 mb-0.5" />
            <span>Planner</span>
          </button>
          <button
            onClick={() => setActiveTab('wardrobe')}
            className={`flex flex-col items-center py-1 px-2 relative ${
              activeTab === 'wardrobe' ? 'text-stone-900 font-bold' : 'text-stone-500'
            }`}
          >
            <Shirt className="w-4 h-4 mb-0.5" />
            <span>Wardrobe ({wardrobe.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex flex-col items-center py-1 px-2 ${
              activeTab === 'upload' ? 'text-stone-900 font-bold' : 'text-stone-500'
            }`}
          >
            <UploadCloud className="w-4 h-4 mb-0.5" />
            <span>Upload</span>
          </button>
          <button
            onClick={() => setActiveTab('rotation')}
            className={`flex flex-col items-center py-1 px-2 ${
              activeTab === 'rotation' ? 'text-stone-900 font-bold' : 'text-stone-500'
            }`}
          >
            <CalendarDays className="w-4 h-4 mb-0.5" />
            <span>Rotation</span>
          </button>
        </div>
      </div>
    </header>
  );
};
