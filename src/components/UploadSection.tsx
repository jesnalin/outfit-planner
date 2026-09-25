import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  Camera,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  Loader2,
  Tag,
  Palette,
  Layers,
  ArrowRight,
  Plus,
} from 'lucide-react';
import { WardrobeItem } from '../types/wardrobe';
import { callAnalyzeClothing, AnalyzeImageResponse } from '../services/api';

interface UploadSectionProps {
  wardrobe: WardrobeItem[];
  onItemAdded: (item: WardrobeItem) => void;
  onNavigateToPlanner: (specificItemId?: string) => void;
}

export const UploadSection: React.FC<UploadSectionProps> = ({
  wardrobe,
  onItemAdded,
  onNavigateToPlanner,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [userHint, setUserHint] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Analysis result state
  const [analysisResult, setAnalysisResult] = useState<AnalyzeImageResponse | null>(null);
  const [createdItem, setCreatedItem] = useState<WardrobeItem | null>(null);

  // Unclear clarification state
  const [needsClarification, setNeedsClarification] = useState(false);
  const [userClarificationAnswer, setUserClarificationAnswer] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    processFile(file);
  };

  const processFile = (file: File) => {
    setError(null);
    setAnalysisResult(null);
    setCreatedItem(null);
    setNeedsClarification(false);

    setMimeType(file.type || 'image/jpeg');

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
    };
    reader.onerror = () => {
      setError('Could not read image file. Please try another image.');
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleAnalyzeAndSave = async (extraClarification?: string) => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const combinedHint = [userHint, extraClarification].filter(Boolean).join('. ');

      const result = await callAnalyzeClothing({
        imageBase64: selectedImage,
        mimeType,
        userHint: combinedHint,
        existingItems: wardrobe,
      });

      setAnalysisResult(result);

      if (!result.isClear && !extraClarification && result.clarificationQuestion) {
        // Needs clarification before completing
        setNeedsClarification(true);
        setIsAnalyzing(false);
        return;
      }

      setNeedsClarification(false);

      // Create new wardrobe item
      const newItem: WardrobeItem = {
        id: 'item-' + Date.now(),
        name: result.name,
        category: result.category,
        subcategory: result.subcategory,
        color: result.color,
        pattern: result.pattern,
        fabric: result.fabric,
        styleTags: result.styleTags,
        weatherSuitability: result.weatherSuitability,
        occasions: result.occasions,
        imageUrl: selectedImage,
        dateAdded: new Date().toISOString(),
        timesWorn: 0,
        notes: userHint || undefined,
      };

      onItemAdded(newItem);
      setCreatedItem(newItem);
    } catch (err: any) {
      console.error('Failed to analyze image:', err);
      setError(err.message || 'Failed to analyze clothing image. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleResetForNext = () => {
    setSelectedImage(null);
    setUserHint('');
    setAnalysisResult(null);
    setCreatedItem(null);
    setNeedsClarification(false);
    setUserClarificationAnswer('');
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-2 text-stone-500 text-xs font-semibold uppercase tracking-wider mb-1">
          <UploadCloud className="w-4 h-4" />
          <span>Closet Digitizer</span>
        </div>
        <h2 className="font-serif text-3xl font-bold text-stone-900">
          Upload Clothing & Build Your Wardrobe
        </h2>
        <p className="text-stone-600 text-sm mt-1">
          Take a photo or upload an image of tops, bottoms, dresses, jackets, shoes, bags, or accessories.
          Our stylist will examine color, fabric, and silhouette, index it into your wardrobe, and immediately propose 2–3 ways to style it.
        </p>
      </div>

      {/* Main Upload Card */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 md:p-8 shadow-sm">
        {!selectedImage ? (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="border-2 border-dashed border-stone-300 rounded-2xl p-10 text-center hover:border-stone-500 hover:bg-stone-50/50 transition cursor-pointer flex flex-col items-center justify-center min-h-[320px]"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-stone-600 mb-4">
              <Camera className="w-8 h-8" />
            </div>

            <h3 className="font-serif text-xl font-semibold text-stone-900 mb-1">
              Select or Drop Clothing Photo
            </h3>
            <p className="text-stone-500 text-xs sm:text-sm max-w-md mb-6">
              Photos on a flat surface, hanger, or worn are all great. Clear lighting helps capture accurate colors & textures.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium px-5 py-2.5 rounded-full transition shadow-sm"
              >
                Choose Photo from Device
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  cameraInputRef.current?.click();
                }}
                className="bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 text-xs font-medium px-4 py-2.5 rounded-full transition"
              >
                Take Photo
              </button>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <input
              type="file"
              ref={cameraInputRef}
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {/* Image Preview */}
              <div className="relative rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 aspect-[4/5] flex items-center justify-center">
                <img
                  src={selectedImage}
                  alt="Clothing preview"
                  className="w-full h-full object-cover"
                />
                {!createdItem && (
                  <button
                    onClick={handleResetForNext}
                    className="absolute top-3 right-3 bg-stone-900/80 hover:bg-stone-900 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm transition"
                  >
                    Change Photo
                  </button>
                )}
              </div>

              {/* Form & Actions */}
              <div className="space-y-5">
                {!createdItem ? (
                  <>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                        Optional notes / styling hints
                      </label>
                      <input
                        type="text"
                        value={userHint}
                        onChange={(e) => setUserHint(e.target.value)}
                        placeholder="e.g., Linen shirt, thrifted oversized blazer, rainy day shoes..."
                        className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900"
                        disabled={isAnalyzing}
                      />
                    </div>

                    {needsClarification && analysisResult?.clarificationQuestion && (
                      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-3">
                        <div className="flex items-start space-x-2 text-amber-800">
                          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                          <div>
                            <div className="font-semibold text-xs uppercase tracking-wider">
                              Stylist clarification needed
                            </div>
                            <p className="text-sm mt-0.5">{analysisResult.clarificationQuestion}</p>
                          </div>
                        </div>

                        <input
                          type="text"
                          value={userClarificationAnswer}
                          onChange={(e) => setUserClarificationAnswer(e.target.value)}
                          placeholder="Type your clarification (e.g. It's a midi skirt, cotton fabric)..."
                          className="w-full px-3.5 py-2 text-sm bg-white rounded-xl border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />

                        <button
                          onClick={() => handleAnalyzeAndSave(userClarificationAnswer)}
                          disabled={!userClarificationAnswer.trim() || isAnalyzing}
                          className="w-full bg-amber-800 hover:bg-amber-900 text-white text-xs font-semibold py-2.5 rounded-xl transition"
                        >
                          Confirm & Save Item
                        </button>
                      </div>
                    )}

                    {error && (
                      <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}

                    {!needsClarification && (
                      <button
                        onClick={() => handleAnalyzeAndSave()}
                        disabled={isAnalyzing}
                        className="w-full flex items-center justify-center space-x-2 bg-stone-900 hover:bg-stone-800 text-white font-medium py-3.5 rounded-full text-sm transition shadow-sm disabled:opacity-50"
                      >
                        {isAnalyzing ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-stone-300" />
                            <span>Analyzing fabric, silhouette & color...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 text-amber-400" />
                            <span>Analyze & Add to Wardrobe</span>
                          </>
                        )}
                      </button>
                    )}
                  </>
                ) : (
                  /* Success Feedback matching prompt specification */
                  <div className="space-y-6">
                    {/* Prompt requirement: Tell user "Added to wardrobe: [item description]." */}
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start space-x-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs uppercase font-bold tracking-wider text-emerald-800">
                          Closet Updated
                        </div>
                        <p className="text-sm font-medium text-emerald-950 mt-0.5">
                          “{analysisResult?.addedDescription || `Added to wardrobe: ${createdItem.name}.`}”
                        </p>
                      </div>
                    </div>

                    {/* Detected properties */}
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center space-x-2 text-stone-700">
                        <Palette className="w-3.5 h-3.5 text-stone-400" />
                        <span className="font-semibold">Color:</span>
                        <span>{createdItem.color}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-stone-700">
                        <Layers className="w-3.5 h-3.5 text-stone-400" />
                        <span className="font-semibold">Fabric & Pattern:</span>
                        <span>{createdItem.fabric} · {createdItem.pattern}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-stone-700">
                        <Tag className="w-3.5 h-3.5 text-stone-400" />
                        <span className="font-semibold">Style:</span>
                        <div className="flex flex-wrap gap-1">
                          {createdItem.styleTags.map((tag, idx) => (
                            <span key={idx} className="bg-stone-100 text-stone-700 px-2 py-0.5 rounded-full text-[10px]">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Prompt requirement: Suggest 2–3 ways to style this item with existing wardrobe */}
                    <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2.5">
                      <div className="flex items-center space-x-1.5 text-stone-900 font-semibold text-xs uppercase tracking-wider">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>Styling Ideas For This Piece</span>
                      </div>

                      <div className="space-y-2">
                        {analysisResult?.stylingSuggestions.map((suggestion, idx) => (
                          <div
                            key={idx}
                            className="text-xs text-stone-700 bg-white p-2.5 rounded-xl border border-stone-100 leading-relaxed"
                          >
                            {suggestion}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Quick navigation actions */}
                    <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                      <button
                        onClick={() => onNavigateToPlanner(createdItem.id)}
                        className="flex-1 flex items-center justify-center space-x-1.5 bg-stone-900 hover:bg-stone-800 text-white font-medium py-3 rounded-full text-xs transition"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span>Plan Outfits with This Item</span>
                      </button>

                      <button
                        onClick={handleResetForNext}
                        className="flex items-center justify-center space-x-1 bg-white hover:bg-stone-100 text-stone-700 border border-stone-300 font-medium py-3 px-5 rounded-full text-xs transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Upload Next Item</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
