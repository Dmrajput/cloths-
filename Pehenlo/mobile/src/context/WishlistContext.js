import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { wishlistService } from '../services/wishlistService';

export const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [ids, setIds] = useState(() => new Set());
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const pending = useRef(new Set());

  const refreshWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      setIds(new Set());
      setCount(0);
      return;
    }
    setLoading(true);
    try {
      const response = await wishlistService.getWishlistIds();
      const listingIds = response?.data?.listingIds || [];
      setIds(new Set(listingIds));
      setCount(listingIds.length);
    } catch (_error) {
      setIds(new Set());
      setCount(0);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshWishlist();
  }, [refreshWishlist]);

  const isFavorite = useCallback((listingId) => ids.has(String(listingId)), [ids]);

  const toggleFavorite = useCallback(async (listingId) => {
    const id = String(listingId || '');
    if (!id) return { ok: false };
    if (!isAuthenticated) return { ok: false, needsLogin: true };
    if (pending.current.has(id)) return { ok: false, pending: true };

    pending.current.add(id);
    const wasFavorite = ids.has(id);
    setIds((current) => {
      const next = new Set(current);
      if (wasFavorite) next.delete(id);
      else next.add(id);
      setCount(next.size);
      return next;
    });

    try {
      const response = wasFavorite
        ? await wishlistService.removeFromWishlist(id)
        : await wishlistService.addToWishlist(id);
      const saved = Boolean(response?.data?.isFavorite);
      setIds((current) => {
        const next = new Set(current);
        if (saved) next.add(id);
        else next.delete(id);
        setCount(next.size);
        return next;
      });
      return { ok: true, isFavorite: saved };
    } catch (error) {
      setIds((current) => {
        const next = new Set(current);
        if (wasFavorite) next.add(id);
        else next.delete(id);
        setCount(next.size);
        return next;
      });
      return { ok: false, error };
    } finally {
      pending.current.delete(id);
    }
  }, [ids, isAuthenticated]);

  const value = useMemo(() => ({
    count,
    loading,
    isFavorite,
    toggleFavorite,
    refreshWishlist,
  }), [count, loading, isFavorite, toggleFavorite, refreshWishlist]);

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return context;
}
