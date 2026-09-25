import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Sparkles,
  Trash2,
  Edit2,
  Clock,
  Layers,
  Palette,
  Plus,
  Tag,
  Check,
  X,
} from 'lucide-react';
import { WardrobeItem, ClothingCategory } from '../types/wardrobe';

interface WardrobeGalleryProps {
  wardrobe: WardrobeItem[];
  onStyleItem: (itemId: string) => void;
  onDeleteItem: (itemId: string) => void;
  onUpdateItem: (item: WardrobeItem) => void;
  onOpenUpload: () => void;
}

const CATEGORIES: { label: string; value: 'all' | ClothingCategory }[] = [
  { label: 'All Items', value: 'all' },
  { label: 'Tops & Shirts', value: 'top' },
  { label: 'Bottoms & Pants', value: 'bottom' },
  { label: 'Dresses', value: 'dress' },
  { label: 'Jackets & Outerwear', value: 'outerwear' },
  { label: 'Shoes', value: 'shoes' },
  { label: 'Bags', value: 'bag' },
  { label: 'Accessories', value: 'accessory' },
];

export const WardrobeGallery: React.FC<WardrobeGalleryProps> = ({
  wardrobe,
  onStyleItem,
  onDeleteItem,
  onUpdateItem,
  onOpenUpload,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | ClothingCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingItem, setEditingItem] = useState<WardrobeItem | null>(null);

  // Filtered items
  const filteredItems = useMemo(() => {
    return wardrobe.filter((item) => {
      const matchesCategory =
        selectedCategory === 'all' || item.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.color.toLowerCase().includes(q) ||
        item.fabric.toLowerCase().includes(q) ||
        item.subcategory.toLowerCase().includes(q) ||
        item.styleTags.some((t) => t.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [wardrobe, selectedCategory, searchQuery]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: wardrobe.length };
    wardrobe.forEach((item) => {
      counts[item.category] = (counts[item.category] || 0) + 1;
    });
    return counts;
  }, [wardrobe]);

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      onUpdateItem(editingItem);
      setEditingItem(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header & Search */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 text-stone-500 text-xs font-semibold uppercase tracking-wider mb-1">
            <span>Closet Inventory</span>
            <span>·</span>
            <span>{wardrobe.length} Pieces Owned</span>
          </div>
          <h2 className="font-serif text-3xl font-bold text-stone-900">
            My Digital Wardrobe
          </h2>
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by color, fabric, style..."
              className="w-full pl-10 pr-4 py-2.5 rounded-full border border-stone-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-stone-900"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={onOpenUpload}
            className="flex items-center space-x-1.5 bg-stone-900 hover:bg-stone-800 text-white px-4 py-2.5 rounded-full text-xs font-medium whitespace-nowrap transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const count = categoryCounts[cat.value] || 0;
          const isActive = selectedCategory === cat.value;
          return (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
              }`}
            >
              <span>{cat.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-stone-700 text-stone-200' : 'bg-stone-100 text-stone-500'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center max-w-md mx-auto my-8">
          <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mx-auto mb-4">
            <Filter className="w-8 h-8" />
          </div>
          <h3 className="font-serif text-xl font-bold text-stone-900 mb-1">
            {searchQuery ? 'No matching pieces found' : 'No items in this category'}
          </h3>
          <p className="text-stone-500 text-xs mb-6">
            {searchQuery
              ? `No items match "${searchQuery}". Try a different keyword.`
              : 'Add clothing pieces to this category to plan outfits with them!'}
          </p>
          <button
            onClick={onOpenUpload}
            className="inline-flex items-center space-x-2 bg-stone-900 hover:bg-stone-800 text-white px-5 py-2.5 rounded-full text-xs font-medium transition"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Item Now</span>
          </button>
        </div>
      ) : (
        /* Wardrobe Items Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl border border-stone-200/90 overflow-hidden shadow-sm hover:shadow-md transition group flex flex-col justify-between"
            >
              {/* Photo Area */}
              <div className="relative aspect-[4/5] bg-stone-100 overflow-hidden">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />

                {/* Category Badge */}
                <div className="absolute top-3 left-3 bg-stone-900/80 backdrop-blur-md text-white text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full">
                  {item.category}
                </div>

                {/* Times Worn Badge */}
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-stone-800 text-[10px] font-medium px-2 py-1 rounded-full flex items-center space-x-1 shadow-sm">
                  <Clock className="w-3 h-3 text-stone-500" />
                  <span>{item.timesWorn || 0} wears</span>
                </div>

                {/* Quick Action Overlay */}
                <div className="absolute inset-0 bg-stone-900/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center p-4">
                  <button
                    onClick={() => onStyleItem(item.id)}
                    className="flex items-center space-x-1.5 bg-white text-stone-900 font-semibold px-4 py-2.5 rounded-full text-xs shadow-lg hover:scale-105 transition"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Style This Piece</span>
                  </button>
                </div>
              </div>

              {/* Details Area */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h4 className="font-serif text-base font-bold text-stone-900 leading-snug line-clamp-1">
                    {item.name}
                  </h4>
                  <div className="flex items-center space-x-2 text-[11px] text-stone-500 mt-1">
                    <span className="flex items-center space-x-1">
                      <Palette className="w-3 h-3 text-stone-400" />
                      <span>{item.color}</span>
                    </span>
                    <span>·</span>
                    <span className="flex items-center space-x-1 truncate">
                      <Layers className="w-3 h-3 text-stone-400" />
                      <span className="truncate">{item.fabric}</span>
                    </span>
                  </div>
                </div>

                {/* Style Tags */}
                <div className="flex flex-wrap gap-1">
                  {item.styleTags.slice(0, 3).map((tag, idx) => (
                    <span
                      key={idx}
                      className="bg-stone-50 text-stone-600 text-[10px] px-2 py-0.5 rounded-md border border-stone-100"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Footer Controls */}
                <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                  <button
                    onClick={() => onStyleItem(item.id)}
                    className="text-stone-900 hover:text-amber-700 font-semibold text-[11px] flex items-center space-x-1"
                  >
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>Style</span>
                  </button>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setEditingItem(item)}
                      className="text-stone-400 hover:text-stone-700 p-1"
                      title="Edit item details"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteItem(item.id)}
                      className="text-stone-400 hover:text-red-600 p-1"
                      title="Delete item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Item Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <h3 className="font-serif text-lg font-bold text-stone-900">
                Edit Clothing Item Details
              </h3>
              <button
                onClick={() => setEditingItem(null)}
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="block font-semibold uppercase text-stone-700 mb-1">
                  Item Name
                </label>
                <input
                  type="text"
                  value={editingItem.name}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-900"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase text-stone-700 mb-1">
                    Category
                  </label>
                  <select
                    value={editingItem.category}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        category: e.target.value as ClothingCategory,
                      })
                    }
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl bg-white"
                  >
                    <option value="top">Top</option>
                    <option value="bottom">Bottom</option>
                    <option value="dress">Dress</option>
                    <option value="outerwear">Outerwear</option>
                    <option value="shoes">Shoes</option>
                    <option value="bag">Bag</option>
                    <option value="accessory">Accessory</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold uppercase text-stone-700 mb-1">
                    Color
                  </label>
                  <input
                    type="text"
                    value={editingItem.color}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, color: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase text-stone-700 mb-1">
                    Fabric / Material
                  </label>
                  <input
                    type="text"
                    value={editingItem.fabric}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, fabric: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase text-stone-700 mb-1">
                    Pattern
                  </label>
                  <input
                    type="text"
                    value={editingItem.pattern}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, pattern: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold uppercase text-stone-700 mb-1">
                  Style Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={editingItem.styleTags.join(', ')}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      styleTags: e.target.value
                        .split(',')
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 border border-stone-200 rounded-full hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-stone-900 text-white rounded-full hover:bg-stone-800 font-medium"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
