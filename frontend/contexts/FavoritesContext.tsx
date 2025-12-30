import React, { createContext, useContext, useState, useEffect } from 'react';
import auditLog from '../services/auditLog';

export interface FavoriteItem {
  id: string;
  title: string;
  description?: string;
  icon?: string; // data URL or emoji or icon name
  meta?: Record<string, any>;
}

interface FavoritesContextType {
  favorites: FavoriteItem[];
  addFavorite: (item: FavoriteItem) => void;
  removeFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  getFavorites: () => FavoriteItem[];
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

const STORAGE_KEY = 'routemind_favorites';

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setFavorites(JSON.parse(raw));
    } catch (e) {
      setFavorites([]);
    }
  }, []);

  const persist = (next: FavoriteItem[]) => {
    setFavorites(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch (e) { }
  };

  const addFavorite = (item: FavoriteItem) => {
    if (favorites.find(f => f.id === item.id)) return;
    const next = [item, ...favorites];
    persist(next);
    try { auditLog.log('favorite_added', 'info', (JSON.parse(localStorage.getItem('routemind_user') || 'null')?.id) ?? null, { itemId: item.id }); } catch (e) { }
  };

  const removeFavorite = (id: string) => {
    const next = favorites.filter(f => f.id !== id);
    persist(next);
    try { auditLog.log('favorite_removed', 'info', (JSON.parse(localStorage.getItem('routemind_user') || 'null')?.id) ?? null, { itemId: id }); } catch (e) { }
  };

  const isFavorite = (id: string) => favorites.some(f => f.id === id);
  const getFavorites = () => favorites;

  return (
    <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite, isFavorite, getFavorites }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider');
  return ctx;
};

export default FavoritesContext;
