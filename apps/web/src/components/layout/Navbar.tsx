'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, User as UserIcon, LogOut, Package, ClipboardList, Heart } from 'lucide-react';
import { useAuthStore } from '../../stores/auth.store';
import { useCartStore } from '../../stores/cart.store';
import { useWishlistStore } from '../../stores/wishlist.store';

export function Navbar() {
  const { user, isAuthenticated, logout, fetchProfile } = useAuthStore();
  const { getItemCount, fetchCart } = useCartStore();
  const { items: wishlistItems, initUserWishlist } = useWishlistStore();
  const itemCount = getItemCount();

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
      fetchCart();
      initUserWishlist(user?.id || user?.email);
    }
  }, [isAuthenticated, fetchProfile, fetchCart, initUserWishlist, user?.id, user?.email]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900">
            <Package className="h-6 w-6 text-indigo-600" />
            <span>Reddy Store</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link href="/shop" className="hover:text-indigo-600 transition-colors">
              Catalog
            </Link>
            {isAuthenticated && (
              <>
                <Link href="/orders" className="hover:text-indigo-600 transition-colors flex items-center gap-1">
                  <ClipboardList className="h-4 w-4" />
                  <span>My Orders</span>
                </Link>
                <Link href="/wishlist" className="hover:text-indigo-600 transition-colors flex items-center gap-1">
                  <Heart className="h-4 w-4" />
                  <span>Wishlist</span>
                </Link>
              </>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {/* Wishlist Icon Button */}
          {isAuthenticated && (
            <Link
              href="/wishlist"
              className="relative flex items-center justify-center rounded-full p-2 text-slate-600 hover:bg-slate-100 hover:text-rose-600 transition-colors"
              aria-label="Wishlist"
            >
              <Heart className="h-5 w-5" />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow">
                  {wishlistItems.length}
                </span>
              )}
            </Link>
          )}

          {/* Cart Icon Button */}
          <Link
            href="/cart"
            className="relative flex items-center justify-center rounded-full p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            aria-label="Shopping Cart"
          >
            <ShoppingBag className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white shadow">
                {itemCount}
              </span>
            )}
          </Link>

          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-slate-700 hidden sm:inline">
                {user?.name || user?.email}
              </span>
              <button
                onClick={() => logout()}
                className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <UserIcon className="h-3.5 w-3.5" />
                <span>Sign In</span>
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 shadow-sm transition-colors"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}