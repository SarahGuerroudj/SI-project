import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, X } from 'lucide-react';
import { FavoriteItem } from '../../contexts/FavoritesContext';
import { defaultMainNavItems, defaultResourceItems } from '../../config/navigation';

interface Props {
  items: FavoriteItem[];
  onRemove: (id: string) => void;
  variant?: 'grid' | 'list';
}

const FavoritesList: React.FC<Props> = ({ items, onRemove, variant = 'grid' }) => {
  const navigate = useNavigate();

  if (!items || items.length === 0) {
    return null;
  }

  const handleItemClick = (item: FavoriteItem) => {
    let path = item.meta?.path;

    // Robust lookup: If path is missing or empty, look it up in the config
    if (!path) {
      const allItems = [...defaultMainNavItems, ...defaultResourceItems];
      const configItem = allItems.find(i => i.id === item.id);
      if (configItem && configItem.path) {
        path = configItem.path;
      }
    }

    console.log('FavoritesList: Clicking item', item.title, 'Resolved path:', path);

    if (path) {
      navigate(path);
    } else {
      console.warn('FavoritesList: No path found for item', item.title);
    }
  };

  return (
    <div className={variant === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
      {items.map(item => (
        <div
          key={item.id}
          onClick={() => handleItemClick(item)}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-start gap-3 cursor-pointer hover:border-lime-500/50 transition-colors"
        >
          <div className="w-12 h-12 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-xl font-bold text-lime-600">{item.icon ? <img src={item.icon} alt="icon" className="w-full h-full object-cover rounded-lg" /> : <Star className="text-lime-500" />}</div>
          <div className="flex-1 min-w-0">
            <h5 className="font-semibold text-slate-900 dark:text-white truncate">{item.title}</h5>
            {item.description && <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{item.description}</p>}
          </div>
          <div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(item.id);
              }}
              className="text-red-500 hover:text-red-700 p-2 rounded-md hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FavoritesList;
