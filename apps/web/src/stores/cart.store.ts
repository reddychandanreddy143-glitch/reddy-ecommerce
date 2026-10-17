import { create } from 'zustand';
import { api } from '../lib/api';

export interface ProductSummary {
  id: string;
  title: string;
  price: string | number;
  stock?: number;
  imageUrl?: string;
}

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: ProductSummary;
}

export interface Cart {
  id: string;
  userId?: string;
  items: CartItem[];
}

interface CartState {
  cart: Cart | null;
  currentUserId: string | null;
  isLoading: boolean;
  initUserCart: (userId?: string | null) => void;
  fetchCart: () => Promise<void>;
  addItem: (product: { id: string; title: string; price: number | string; imageUrl?: string }, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  removeMultipleItems: (itemIds: string[]) => Promise<void>;
  clearCart: () => Promise<void>;
  getItemCount: () => number;
  getSubtotal: () => number;
}

const getStorageKey = (userId?: string | null) => {
  return userId ? `reddy_cart_${userId}` : 'reddy_cart_guest';
};

const loadLocalCart = (userId?: string | null): Cart => {
  if (typeof window === 'undefined') return { id: 'local-cart', items: [] };
  const key = getStorageKey(userId);
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed?.items)) {
        // Filter out malformed/corrupted items (e.g. items with missing or invalid title)
        parsed.items = parsed.items.filter((item: any) => item?.productId && item?.product?.title);
        return parsed;
      }
    }
  } catch {}
  return { id: `cart-${userId || 'guest'}`, items: [] };
};

const saveLocalCart = (userId: string | null | undefined, cart: Cart | null) => {
  if (typeof window === 'undefined' || !cart) return;
  const key = getStorageKey(userId);
  try {
    localStorage.setItem(key, JSON.stringify(cart));
  } catch {}
};

export const useCartStore = create<CartState>((set, get) => ({
  cart: { id: 'local-cart', items: [] },
  currentUserId: null,
  isLoading: false,

  initUserCart: (userId?: string | null) => {
    const targetUserId = userId || null;
    const existingCart = loadLocalCart(targetUserId);
    set({
      currentUserId: targetUserId,
      cart: existingCart,
    });
  },

  fetchCart: async () => {
    const { currentUserId } = get();
    try {
      const res = await api.get('/cart');
      const serverItems: any[] = res.data?.items || [];
      
      const cleanItems: CartItem[] = serverItems
        .filter((sItem) => sItem && (sItem.productId || sItem.id))
        .map((sItem) => ({
          id: sItem.id || `server-${sItem.productId}`,
          productId: sItem.productId || sItem.product?.id,
          quantity: sItem.quantity || 1,
          product: {
            id: sItem.product?.id || sItem.productId,
            title: sItem.product?.title || 'Product',
            price: sItem.product?.price ?? 0,
            imageUrl: sItem.product?.imageUrl || sItem.product?.images?.[0] || '',
          },
        }));

      const updatedCart: Cart = {
        id: res.data?.id || get().cart?.id || `cart-${currentUserId || 'guest'}`,
        userId: currentUserId || undefined,
        items: cleanItems,
      };

      set({ cart: updatedCart });
      saveLocalCart(currentUserId, updatedCart);
    } catch {
      // Fallback to local cart if network fails
    }
  },

  addItem: async (product, quantity = 1) => {
    set({ isLoading: true });
    try {
      const { currentUserId } = get();
      const currentItems = get().cart?.items ? [...get().cart!.items] : [];
      const existingIndex = currentItems.findIndex((i) => i.productId === product.id);

      if (existingIndex > -1) {
        currentItems[existingIndex].quantity += quantity;
      } else {
        currentItems.push({
          id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          productId: product.id,
          quantity,
          product: {
            id: product.id,
            title: product.title,
            price: product.price,
            imageUrl: product.imageUrl,
          },
        });
      }

      const updatedCart: Cart = {
        id: get().cart?.id || `cart-${currentUserId || 'guest'}`,
        userId: currentUserId || undefined,
        items: currentItems,
      };

      set({ cart: updatedCart });
      saveLocalCart(currentUserId, updatedCart);

      api.post('/cart/items', { productId: product.id, quantity }).catch(() => {});
    } finally {
      set({ isLoading: false });
    }
  },

  updateQuantity: async (itemId: string, quantity: number) => {
    const { currentUserId } = get();
    const currentItems = get().cart?.items ? [...get().cart!.items] : [];
    const index = currentItems.findIndex((i) => i.id === itemId);
    if (index > -1) {
      if (quantity <= 0) {
        currentItems.splice(index, 1);
        api.delete(`/cart/items/${itemId}`).catch(() => {});
      } else {
        currentItems[index].quantity = quantity;
        api.patch(`/cart/items/${itemId}`, { quantity }).catch(() => {});
      }
      const updatedCart: Cart = {
        id: get().cart?.id || `cart-${currentUserId || 'guest'}`,
        userId: currentUserId || undefined,
        items: currentItems,
      };
      set({ cart: updatedCart });
      saveLocalCart(currentUserId, updatedCart);
    }
  },

  removeItem: async (itemId: string) => {
    const { currentUserId } = get();
    const currentItems = (get().cart?.items || []).filter((i) => i.id !== itemId);
    const updatedCart: Cart = {
      id: get().cart?.id || `cart-${currentUserId || 'guest'}`,
      userId: currentUserId || undefined,
      items: currentItems,
    };
    set({ cart: updatedCart });
    saveLocalCart(currentUserId, updatedCart);

    api.delete(`/cart/items/${itemId}`).catch(() => {});
  },

  removeMultipleItems: async (itemIds: string[]) => {
    const { currentUserId } = get();
    const idSet = new Set(itemIds);
    const currentItems = (get().cart?.items || []).filter((i) => !idSet.has(i.id));
    const updatedCart: Cart = {
      id: get().cart?.id || `cart-${currentUserId || 'guest'}`,
      userId: currentUserId || undefined,
      items: currentItems,
    };
    set({ cart: updatedCart });
    saveLocalCart(currentUserId, updatedCart);

    itemIds.forEach((id) => {
      api.delete(`/cart/items/${id}`).catch(() => {});
    });
  },

  clearCart: async () => {
    const { currentUserId } = get();
    const emptyCart: Cart = {
      id: `cart-${currentUserId || 'guest'}`,
      userId: currentUserId || undefined,
      items: [],
    };
    set({ cart: emptyCart });
    saveLocalCart(currentUserId, emptyCart);

    api.delete('/cart').catch(() => {});
  },

  getItemCount: () => {
    const items = get().cart?.items || [];
    return items.reduce((acc, item) => acc + (item.quantity || 1), 0);
  },

  getSubtotal: () => {
    const items = get().cart?.items || [];
    return items.reduce((acc, item) => {
      const price = typeof item.product?.price === 'number'
        ? item.product.price
        : parseFloat(String(item.product?.price || 0)) || 0;
      return acc + price * (item.quantity || 1);
    }, 0);
  },
}));