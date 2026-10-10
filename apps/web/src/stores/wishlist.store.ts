import { create } from 'zustand';

export interface WishlistItem {
  id: string;
  title: string;
  price: number;
  imageUrl?: string;
  category?: { name: string };
  rating?: number;
}

interface WishlistState {
  items: WishlistItem[];
  currentUserId: string | null;
  initUserWishlist: (userId?: string) => void;
  toggleWishlist: (product: WishlistItem) => void;
  isInWishlist: (productId: string) => boolean;
  removeItem: (productId: string) => void;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],
  currentUserId: null,

  initUserWishlist: (userId?: string) => {
    if (typeof window === 'undefined') return;
    const resolvedId = userId || 'guest';
    set({ currentUserId: resolvedId });

    try {
      const stored = localStorage.getItem(`reddy_wishlist_${resolvedId}`);
      if (stored) {
        set({ items: JSON.parse(stored) });
      } else {
        set({ items: [] });
      }
    } catch {
      set({ items: [] });
    }
  },

  toggleWishlist: (product: WishlistItem) => {
    const { items, currentUserId } = get();
    const exists = items.some((item) => item.id === product.id);

    const updated = exists
      ? items.filter((item) => item.id !== product.id)
      : [...items, product];

    set({ items: updated });

    if (typeof window !== 'undefined' && currentUserId) {
      localStorage.setItem(`reddy_wishlist_${currentUserId}`, JSON.stringify(updated));
    }
  },

  isInWishlist: (productId: string) => {
    return get().items.some((item) => item.id === productId);
  },

  removeItem: (productId: string) => {
    const { items, currentUserId } = get();
    const updated = items.filter((item) => item.id !== productId);
    set({ items: updated });

    if (typeof window !== 'undefined' && currentUserId) {
      localStorage.setItem(`reddy_wishlist_${currentUserId}`, JSON.stringify(updated));
    }
  },

  clearWishlist: () => {
    const { currentUserId } = get();
    set({ items: [] });
    if (typeof window !== 'undefined' && currentUserId) {
      localStorage.removeItem(`reddy_wishlist_${currentUserId}`);
    }
  },
}));