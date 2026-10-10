'use client';

import React, { useState } from 'react';
import { ShoppingCart, Check, Star, Heart } from 'lucide-react';
import { useCartStore } from '../../stores/cart.store';
import { useAuthStore } from '../../stores/auth.store';
import { useWishlistStore } from '../../stores/wishlist.store';
import { useRouter } from 'next/navigation';

export interface Product {
  id: string;
  title: string;
  description?: string;
  price: string | number;
  stock: number;
  imageUrl?: string;
  category?: { name: string };
  rating?: number;
  discountBadge?: string;
  highlights?: string[];
}

const getFallbackImage = (title: string, catName?: string) => {
  const query = `${catName || ''} ${title}`.toLowerCase();
  if (query.includes('phone') || query.includes('mobile') || query.includes('iphone')) {
    return 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&auto=format&fit=crop&q=80';
  }
  if (query.includes('laptop') || query.includes('vivobook') || query.includes('macbook')) {
    return 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&auto=format&fit=crop&q=80';
  }
  if (query.includes('headphone') || query.includes('audio') || query.includes('earbud')) {
    return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80';
  }
  if (query.includes('watch') || query.includes('smartwatch')) {
    return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';
  }
  if (query.includes('tv') || query.includes('oled') || query.includes('appliance')) {
    return 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&auto=format&fit=crop&q=80';
  }
  if (query.includes('shoe') || query.includes('sneaker') || query.includes('fashion')) {
    return 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80';
  }
  return 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80';
};

interface ProductCardProps {
  product: Product;
  onSelect?: (product: Product) => void;
}

export function ProductCard({ product, onSelect }: ProductCardProps) {
  const router = useRouter();
  const { addItem, isLoading } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const [added, setAdded] = useState(false);

  const imageSrc = product.imageUrl || getFallbackImage(product.title, product.category?.name);
  const wishlisted = isInWishlist(product.id);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    await addItem({
      id: product.id,
      title: product.title,
      price: product.price,
      imageUrl: imageSrc,
    }, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    toggleWishlist({
      id: product.id,
      title: product.title,
      price: Number(product.price),
      imageUrl: imageSrc,
      category: product.category,
      rating: product.rating,
    });
  };

  const formattedPrice = Number(product.price).toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  });

  return (
    <div
      onClick={() => onSelect && onSelect({ ...product, imageUrl: imageSrc })}
      className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-slate-50 p-4">
        {product.discountBadge && (
          <span className="absolute left-2.5 top-2.5 z-10 rounded bg-emerald-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
            {product.discountBadge}
          </span>
        )}

        {/* Wishlist Heart Button */}
        <button
          onClick={handleToggleWishlist}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          className="absolute right-2.5 top-2.5 z-10 rounded-full bg-white/90 p-2 text-slate-400 shadow-sm backdrop-blur hover:scale-110 hover:bg-white transition"
        >
          <Heart
            className={`h-4 w-4 transition-colors ${
              wishlisted
                ? 'fill-rose-500 text-rose-500'
                : 'text-slate-400 hover:text-rose-500'
            }`}
          />
        </button>

        <img
          src={imageSrc}
          alt={product.title}
          className="h-full w-full object-contain object-center transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center gap-2 mb-1.5">
          {product.category?.name && (
            <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
              {product.category.name}
            </span>
          )}
          <div className="flex items-center gap-0.5 rounded bg-emerald-700 px-1.5 py-0.5 text-[11px] font-bold text-white">
            <span>{product.rating || '4.3'}</span>
            <Star className="h-2.5 w-2.5 fill-current" />
          </div>
        </div>

        <h3 className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
          {product.title}
        </h3>
        <p className="mt-1 text-xs text-slate-500 line-clamp-2">
          {product.description || 'Verified authentic item directly from top-rated sellers.'}
        </p>

        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
          <div>
            <span className="block text-[11px] font-medium text-slate-400">Special Price</span>
            <span className="text-base font-extrabold text-slate-900">{formattedPrice}</span>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isLoading || product.stock === 0}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold shadow-sm transition ${
              product.stock === 0
                ? 'cursor-not-allowed bg-slate-100 text-slate-400'
                : added
                ? 'bg-emerald-600 text-white'
                : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
            }`}
          >
            {added ? (
              <>
                <Check className="h-3.5 w-3.5" />
                <span>Added</span>
              </>
            ) : (
              <>
                <ShoppingCart className="h-3.5 w-3.5" />
                <span>{product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}