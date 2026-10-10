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
  removeMultipleItems: (itemIds: string[]) => void;
  clearCart: () => void;
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
    if (raw) return JSON.parse(raw);
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
      if (serverItems.length > 0) {
        const currentItems = get().cart?.items ? [...get().cart!.items] : [];

        serverItems.forEach((sItem) => {
          const existingIdx = currentItems.findIndex(
            (ci) => ci.productId === sItem.productId || ci.id === sItem.id
          );
          if (existingIdx > -1) {
            currentItems[existingIdx].quantity = sItem.quantity;
          } else {
            currentItems.push({
              id: sItem.id || `server-${sItem.productId}`,
              productId: sItem.productId,
              quantity: sItem.quantity,
              product: {
                id: sItem.product?.id || sItem.productId,
                title: sItem.product?.title || 'Product',
                price: sItem.product?.price || 0,
                imageUrl: sItem.product?.imageUrl || sItem.product?.images?.[0],
              },
            });
          }
        });

        const updatedCart: Cart = {
          id: res.data.id || get().cart?.id || `cart-${currentUserId || 'guest'}`,
          userId: currentUserId || undefined,
          items: currentItems,
        };

        set({ cart: updatedCart });
        saveLocalCart(currentUserId, updatedCart);
      }
    } catch {
      // Offline fallback: keep local cart intact
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

      // Async backend sync
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
      } else {
        currentItems[index].quantity = quantity;
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
    const currentItems = get().cart?.items ? [...get().cart!.items] : [];
    const filtered = currentItems.filter((i) => i.id !== itemId);
    const updatedCart: Cart = {
      id: get().cart?.id || `cart-${currentUserId || 'guest'}`,
      userId: currentUserId || undefined,
      items: filtered,
    };
    set({ cart: updatedCart });
    saveLocalCart(currentUserId, updatedCart);
    api.delete(`/cart/items/${itemId}`).catch(() => {});
  },

  removeMultipleItems: (itemIds: string[]) => {
    const { currentUserId } = get();
    const currentItems = get().cart?.items ? [...get().cart!.items] : [];
    const filtered = currentItems.filter((i) => !itemIds.includes(i.id));
    const updatedCart: Cart = {
      id: get().cart?.id || `cart-${currentUserId || 'guest'}`,
      userId: currentUserId || undefined,
      items: filtered,
    };
    set({ cart: updatedCart });
    saveLocalCart(currentUserId, updatedCart);
    itemIds.forEach((id) => api.delete(`/cart/items/${id}`).catch(() => {}));
  },

  clearCart: () => {
    const { currentUserId } = get();
    const emptyCart: Cart = { id: `cart-${currentUserId || 'guest'}`, items: [] };
    set({ cart: emptyCart });
    saveLocalCart(currentUserId, emptyCart);
    api.delete('/cart').catch(() => {});
  },

  getItemCount: () => {
    const items = get().cart?.items || [];
    return items.reduce((acc, item) => acc + item.quantity, 0);
  },

  getSubtotal: () => {
    const items = get().cart?.items || [];
    return items.reduce((acc, item) => {
      const price = Number(item.product?.price || 0);
      return acc + price * item.quantity;
    }, 0);
  },
}));