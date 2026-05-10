import { useEffect, useState, useCallback } from 'react';

const STORAGE_KEY = 'rentease_recently_viewed_v1';

function safeRead() {
  try {
    if (typeof window === 'undefined') return [];
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to read recently viewed from localStorage', e);
    return [];
  }
}

function safeWrite(list) {
  try {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Failed to write recently viewed to localStorage', e);
  }
}

export function useRecentlyViewed() {
  const [items, setItems] = useState(() => safeRead());

  useEffect(() => {
    setItems(safeRead());
  }, []);

  const add = useCallback((product) => {
    if (!product || !product._id) return;
    const minimal = {
      _id: product._id || product.id,
      name: product.name,
      image: product.image || product.imageUrl || '/placeholder.png',
      monthlyRent: product.monthlyRent ?? product.price ?? 0,
      availability: Boolean(product.availability),
    };

    setItems((prev) => {
      const deduped = prev.filter((p) => p._id !== minimal._id);
      const next = [minimal, ...deduped].slice(0, 5);
      safeWrite(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setItems([]);
    } catch (e) {
      console.error(e);
    }
  }, []);

  return { items, add, clear };
}

export default useRecentlyViewed;
