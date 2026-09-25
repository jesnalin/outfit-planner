import React, { useState, useEffect } from 'react';
import {
  ActiveTab,
  WardrobeItem,
  WornHistoryEntry,
  OutfitOption,
} from './types/wardrobe';
import {
  getStoredWardrobe,
  saveStoredWardrobe,
  addWardrobeItem,
  updateWardrobeItem,
  deleteWardrobeItem,
  getStoredHistory,
  logOutfitWorn,
  getRecentlyWornItemIds,
} from './services/storage';
import { SAMPLE_WARDROBE } from './data/sampleWardrobe';
import { Navbar } from './components/Navbar';
import { WelcomeBanner } from './components/WelcomeBanner';
import { DailyPlanner } from './components/DailyPlanner';
import { WardrobeGallery } from './components/WardrobeGallery';
import { UploadSection } from './components/UploadSection';
import { RotationHistory } from './components/RotationHistory';
import { CheckCircle2, Sparkles, X } from 'lucide-react';

export default function App() {
  const [wardrobe, setWardrobe] = useState<WardrobeItem[]>([]);
  const [history, setHistory] = useState<WornHistoryEntry[]>([]);
  const [recentlyWornItemIds, setRecentlyWornItemIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveTab>('planner');
  const [focusItemId, setFocusItemId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load stored state on mount
  useEffect(() => {
    const storedItems = getStoredWardrobe();
    setWardrobe(storedItems);

    const storedHist = getStoredHistory();
    setHistory(storedHist);

    const recentIds = getRecentlyWornItemIds();
    setRecentlyWornItemIds(recentIds);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleItemAdded = (item: WardrobeItem) => {
    const updated = addWardrobeItem(item);
    setWardrobe(updated);
    showToast(`Added “${item.name}” to your digital wardrobe.`);
  };

  const handleUpdateItem = (item: WardrobeItem) => {
    const updated = updateWardrobeItem(item);
    setWardrobe(updated);
    showToast(`Updated details for “${item.name}”.`);
  };

  const handleDeleteItem = (itemId: string) => {
    const item = wardrobe.find((i) => i.id === itemId);
    const updated = deleteWardrobeItem(itemId);
    setWardrobe(updated);
    showToast(`Removed “${item?.name || 'Item'}” from wardrobe.`);
  };

  const handleLoadSample = () => {
    saveStoredWardrobe(SAMPLE_WARDROBE);
    setWardrobe(SAMPLE_WARDROBE);
    showToast('Loaded 14 curated essential wardrobe pieces!');
  };

  const handleClearWardrobe = () => {
    if (window.confirm('Are you sure you want to clear all clothing items from your wardrobe?')) {
      saveStoredWardrobe([]);
      setWardrobe([]);
      showToast('Wardrobe cleared.');
    }
  };

  const handleStyleSpecificItem = (itemId: string) => {
    setFocusItemId(itemId);
    setActiveTab('planner');
  };

  const handleWearOutfit = (
    outfit: OutfitOption,
    occasion: string,
    weather: string
  ) => {
    const today = new Date().toISOString().split('T')[0];
    const itemIds = [
      outfit.topItem?.id,
      outfit.bottomItem?.id,
      outfit.shoesItem?.id,
      outfit.bagItem?.id,
      outfit.accessoriesItem?.id,
    ].filter(Boolean) as string[];

    const result = logOutfitWorn({
      date: today,
      outfitVibe: outfit.vibe,
      itemIds,
      occasion,
      weather,
      hair: outfit.hair,
      stylingTip: outfit.stylingTip,
      whyItWorks: outfit.whyItWorks,
    });

    setHistory(result.history);
    setWardrobe(result.wardrobe);
    setRecentlyWornItemIds(getRecentlyWornItemIds());

    showToast(`Logged Option ${outfit.optionNumber} (${outfit.vibe}) as worn today!`);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col font-sans">
      {/* Sticky Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        wardrobe={wardrobe}
        onLoadSample={handleLoadSample}
        onClearWardrobe={handleClearWardrobe}
        onOpenUpload={() => setActiveTab('upload')}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Welcome greeting banner: Always asks the user to upload photos of their wardrobe in the beginning */}
        <WelcomeBanner
          onOpenUpload={() => setActiveTab('upload')}
          onLoadSample={handleLoadSample}
          wardrobeCount={wardrobe.length}
        />

        {/* Tab Router */}
        {activeTab === 'planner' && (
          <DailyPlanner
            wardrobe={wardrobe}
            recentlyWornItemIds={recentlyWornItemIds}
            initialSpecificItemId={focusItemId}
            onClearSpecificItem={() => setFocusItemId(null)}
            onWearOutfit={handleWearOutfit}
            onOpenUpload={() => setActiveTab('upload')}
          />
        )}

        {activeTab === 'wardrobe' && (
          <WardrobeGallery
            wardrobe={wardrobe}
            onStyleItem={handleStyleSpecificItem}
            onDeleteItem={handleDeleteItem}
            onUpdateItem={handleUpdateItem}
            onOpenUpload={() => setActiveTab('upload')}
          />
        )}

        {activeTab === 'upload' && (
          <UploadSection
            wardrobe={wardrobe}
            onItemAdded={handleItemAdded}
            onNavigateToPlanner={(specificItemId) => {
              if (specificItemId) setFocusItemId(specificItemId);
              setActiveTab('planner');
            }}
          />
        )}

        {activeTab === 'rotation' && (
          <RotationHistory
            wardrobe={wardrobe}
            history={history}
            onStyleItem={handleStyleSpecificItem}
          />
        )}
      </main>

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center space-x-3 text-xs sm:text-sm animate-bounce-short border border-stone-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-stone-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-stone-200/80 bg-stone-100/50 py-8 mt-16 text-center text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <div className="font-serif text-sm font-bold tracking-wider text-stone-900">
            ATELIER STYLIST
          </div>
          <p>
            Curating mindful, practical, weather-conscious outfits strictly from your uploaded closet.
          </p>
          <p className="text-[11px] text-stone-400">
            Zero fast-fashion pressure · Rotation intelligence · Respecting your personal collection
          </p>
        </div>
      </footer>
    </div>
  );
}
