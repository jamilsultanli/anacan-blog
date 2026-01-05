
import React from 'react';
import { VISUAL_CATEGORIES, UI_STRINGS } from '../constants';

interface CategoryRailProps {
  activeCategory: string;
  onSelect: (cat: string) => void;
}

const CategoryRail: React.FC<CategoryRailProps> = ({ activeCategory, onSelect }) => {
  return (
    <div className="py-8">
      <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
        <button
           onClick={() => onSelect('Hamısı')}
           className={`flex-shrink-0 flex items-center space-x-2 px-6 py-3 rounded-2xl transition-all border ${
              activeCategory === 'Hamısı'
              ? 'bg-gray-900 text-white border-gray-900 shadow-lg'
              : 'bg-white text-gray-600 border-gray-100 hover:border-gray-200 hover:bg-gray-50'
           }`}
        >
           <span className="font-bold">{UI_STRINGS.allCategories}</span>
        </button>
        {VISUAL_CATEGORIES.map(cat => (
           <button
             key={cat.id}
             onClick={() => onSelect(cat.filter)}
             className={`flex-shrink-0 flex items-center space-x-3 px-6 py-3 rounded-2xl transition-all border ${
                activeCategory === cat.filter
                ? 'bg-white border-rose-500 shadow-lg ring-2 ring-rose-100'
                : 'bg-white text-gray-600 border-gray-100 hover:border-rose-200 hover:shadow-md'
             }`}
           >
              <span className={`w-8 h-8 flex items-center justify-center rounded-full text-sm ${cat.color} bg-opacity-20`}>
                 {cat.icon}
              </span>
              <span className={`font-bold ${activeCategory === cat.filter ? 'text-gray-900' : 'text-gray-600'}`}>
                 {cat.name}
              </span>
           </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryRail;
