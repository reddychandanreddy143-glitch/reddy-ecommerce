'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useWishlistStore, WishlistItem } from '@/stores/wishlist.store';
import { useCartStore } from '@/stores/cart.store';
import { useAuthStore } from '@/stores/auth.store';
import {
  Heart,
  ShoppingCart,
  Trash2,
  ArrowRight,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';

export default function WishlistPage() {
  const router = useRouter();
  const { items, initUserWishlist, removeItem } = useWishlistStore();
  const { addItem } = useCartStore();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    initUserWishlist(user?.id || user?.email);
  }, [isAuthenticated, user?.id, user?.email, router, initUserWishlist]);

  const handleMoveToCart = async (product: WishlistItem) => {
    await addItem(product.id, 1);
    removeItem(product.id);
  };

  if (!isAuthenticated) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              My Wishlist
            </h1>
            <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-bold text-rose-700">
              {items.length} {items.length === 1 ? 'item' : 'items'}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Saved items isolated to account: <span className="font-semibold text-slate-700">{user?.name}</span> ({user?.email})
          </p>
        </div>

        <Link
          href="/shop"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700"
        >
          <span>Continue Shopping</span> <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
          <Heart className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="mt-3 text-base font-bold text-slate-900">Your Wishlist is Empty</h3>
          <p className="mt-1 text-xs text-slate-500">
            Explore our collection and click the heart icon on any item to save it for later.
          </p>
          <div className="mt-6">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-blue-700 transition"
            >
              <ShoppingBag className="h-4 w-4" /> Explore Catalog
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {items.map((product) => (
            <div
              key={product.id}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
            >
              {/* Product Image */}
              <div className="relative aspect-square w-full overflow-hidden bg-slate-50 p-4">
                <img
                  src={
                    product.imageUrl ||
                    'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&auto=format&fit=crop&q=80'
                  }
                  alt={product.title}
                  className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
                />
                <button
                  onClick={() => removeItem(product.id)}
                  aria-label="Remove from wishlist"
                  className="absolute right-3 top-3 rounded-full bg-white/90 p-2 text-slate-400 shadow-sm backdrop-blur hover:bg-rose-50 hover:text-rose-600 transition"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Product Info */}
              <div className="flex flex-1 flex-col p-4">
                {product.category?.name && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                    {product.category.name}
                  </span>
                )}
                <h3 className="mt-1 text-sm font-bold text-slate-900 line-clamp-2">
                  {product.title}
                </h3>

                <div className="mt-auto pt-3 flex items-center justify-between">
                  <div>
                    <span className="text-base font-black text-slate-900">
                      {Number(product.price).toLocaleString('en-IN', {
                        style: 'currency',
                        currency: 'INR',
                        maximumFractionDigits: 0,
                      })}
                    </span>
                  </div>
                </div>

                {/* Move to Cart Button */}
                <button
                  onClick={() => handleMoveToCart(product)}
                  className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-blue-600 py-2.5 text-xs font-bold text-white shadow hover:bg-blue-700 transition"
                >
                  <ShoppingCart className="h-3.5 w-3.5" />
                  <span>Move to Cart</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}