import React from 'react';
import { Star, X } from 'lucide-react';
import { FavoriteItem } from '../../contexts/FavoritesContext';

interface Props {
  items: FavoriteItem[];
  onRemove: (id: string) => void;
  variant?: 'grid' | 'list';
}

const FavoritesList: React.FC<Props> = ({ items, onRemove, variant = 'grid' }) => {
  if (!items || items.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500">
        <div className="mx-auto w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
          <Star className="text-lime-500" size={32} />
        </div>
        <h4 className="font-semibold text-lg mb-1">No favorites yet</h4>
        <p className="text-sm">Add items to your favorites to see them here.</p>
      </div>
    );
  }

  return (
    <div className={variant === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
      {items.map(item => (
        <div key={item.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-start gap-3">
          <div className="w-12 h-12 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-xl font-bold text-lime-600">{item.icon ? <img src={item.icon} alt="icon" className="w-full h-full object-cover rounded-lg" /> : <Star className="text-lime-500" />}</div>
          <div className="flex-1 min-w-0">
            <h5 className="font-semibold text-slate-900 dark:text-white truncate">{item.title}</h5>
            {item.description && <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{item.description}</p>}
          </div>
          <div>
            <button onClick={() => onRemove(item.id)} className="text-red-500 hover:text-red-700 p-2 rounded-md">
              <X size={18} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FavoritesList;
