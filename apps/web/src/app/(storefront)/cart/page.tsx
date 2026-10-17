'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore } from '../../../stores/cart.store';
import { useAuthStore } from '../../../stores/auth.store';
import { api } from '../../../lib/api';
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Loader2,
  CheckCircle2,
  MapPin,
  Banknote,
  X,
  Zap,
  PlusCircle,
  CheckSquare,
  Square,
  LogIn,
} from 'lucide-react';

interface SavedAddress {
  address: string;
  city: string;
  pincode: string;
  phone: string;
}

export default function CartPage() {
  const router = useRouter();
  const { cart, fetchCart, updateQuantity, removeItem, removeMultipleItems, initUserCart, isLoading } = useCartStore();
  const { isAuthenticated, user } = useAuthStore();

  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [savedAddress, setSavedAddress] = useState<SavedAddress | null>(null);
  const [useNewAddress, setUseNewAddress] = useState(false);

  // Address Form State
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState<string | null>(null);

  // Selected item IDs (Default: all items selected)
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);

  const userStorageKey = user?.id ? 'reddy_saved_address_' + user.id : user?.email ? 'reddy_saved_address_' + user.email : null;

  useEffect(() => {
    initUserCart(user?.id || user?.email || null);
    fetchCart();

    if (typeof window !== 'undefined' && userStorageKey) {
      const stored = localStorage.getItem(userStorageKey);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setSavedAddress(parsed);
          setUseNewAddress(false);
        } catch {
          setSavedAddress(null);
          setUseNewAddress(true);
        }
      } else {
        setSavedAddress(null);
        setUseNewAddress(true);
      }
    }
  }, [userStorageKey, user?.id, user?.email, initUserCart, fetchCart]);

  const items = cart?.items || [];

  useEffect(() => {
    if (items.length > 0) {
      setSelectedItemIds((prev) => {
        const existingValid = prev.filter((id) => items.some((item) => item.id === id));
        const newIds = items.filter((item) => !prev.includes(item.id)).map((i) => i.id);
        return [...existingValid, ...newIds];
      });
    } else {
      setSelectedItemIds([]);
    }
  }, [items.length]);

  const toggleItemSelection = (id: string) => {
    setSelectedItemIds((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  const allSelected = items.length > 0 && selectedItemIds.length === items.length;
  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedItemIds([]);
    } else {
      setSelectedItemIds(items.map((i) => i.id));
    }
  };

  const selectedItems = useMemo(() => {
    return items.filter((item) => selectedItemIds.includes(item.id));
  }, [items, selectedItemIds]);

  const selectedSubtotal = useMemo(() => {
    return selectedItems.reduce((acc, item) => {
      const price = Number(item.product?.price || 0);
      return acc + price * item.quantity;
    }, 0);
  }, [selectedItems]);

  const handleOpenBooking = () => {
    if (selectedItems.length === 0) return;

    // Guest checkout guard: redirect to login with callback to return to cart
    if (!isAuthenticated) {
      router.push('/login?redirect=/cart');
      return;
    }

    if (savedAddress) {
      setUseNewAddress(false);
    } else {
      setUseNewAddress(true);
    }
    setIsBookingModalOpen(true);
  };

  const handleConfirmOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItems.length === 0) return;
    setIsSubmitting(true);

    let finalAddress = '';
    if (useNewAddress || !savedAddress) {
      finalAddress = address.trim() + ', ' + city.trim() + ' - ' + pincode.trim() + ' (Phone: ' + phone.trim() + ')';
      const toSave: SavedAddress = { address, city, pincode, phone };
      setSavedAddress(toSave);
      if (typeof window !== 'undefined' && userStorageKey) {
        localStorage.setItem(userStorageKey, JSON.stringify(toSave));
      }
    } else {
      finalAddress = savedAddress.address + ', ' + savedAddress.city + ' - ' + savedAddress.pincode + ' (Phone: ' + savedAddress.phone + ')';
    }

    const titles = selectedItems.map((i) => (i.product?.title || 'Item') + ' (x' + i.quantity + ')').join(', ');
    const bookedIds = selectedItems.map((i) => i.id);

    try {
      const res = await api.post('/orders/book-now', {
        productTitle: titles,
        price: selectedSubtotal,
        deliveryAddress: finalAddress,
        customerName: user?.name || 'Customer',
        customerEmail: user?.email,
      });

      if (res.data?.success || res.status === 201 || res.status === 200) {
        removeMultipleItems(bookedIds);
        setOrderComplete('Order Confirmed! Your items will arrive within 5 to 7 days.');
        setIsBookingModalOpen(false);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to place order';
      alert('Booking Error: ' + msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderComplete) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-500 animate-in zoom-in duration-300" />
        <h2 className="mt-4 text-2xl font-bold text-slate-900">Order Placed Successfully!</h2>
        <p className="mt-2 text-sm text-slate-600">{orderComplete}</p>
        <div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-900">
          <Banknote className="h-4 w-4 text-amber-700" />
          <span>Payment Mode: Cash on Delivery (COD)</span>
        </div>
        <p className="mt-3 text-xs text-slate-500">
          A confirmation email with order details has been dispatched to your email address ({user?.email}).
        </p>
        <div className="mt-6 flex justify-center gap-4">
          <Link
            href="/orders"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 shadow transition"
          >
            Track in My Orders <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">Shopping Cart</h1>
          <p className="text-xs text-slate-500 mt-1">
            {items.length} items in basket ({selectedItems.length} selected for checkout)
          </p>
        </div>
        <Link href="/shop" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
          + Add more items
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-300 p-12 text-center bg-white">
          <ShoppingBag className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-3 text-base font-semibold text-slate-900">Your Cart is Empty</h3>
          <p className="mt-1 text-xs text-slate-500">Discover handpicked items and deals in our catalog.</p>
          <div className="mt-6">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 shadow-sm transition"
            >
              Browse Catalog <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Items List */}
          <div className="space-y-4 lg:col-span-8">
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <button
                onClick={toggleSelectAll}
                className="flex items-center gap-2.5 text-xs font-bold text-slate-800 hover:text-blue-600 transition"
              >
                {allSelected ? (
                  <CheckSquare className="h-4 w-4 text-blue-600" />
                ) : (
                  <Square className="h-4 w-4 text-slate-400" />
                )}
                <span>Select All Items ({items.length})</span>
              </button>
              <span className="text-xs font-semibold text-slate-500">
                {selectedItems.length} of {items.length} items selected
              </span>
            </div>

            {items.map((item) => {
              const isSelected = selectedItemIds.includes(item.id);
              return (
                <div
                  key={item.id}
                  className={
                    'flex items-center justify-between rounded-xl border p-4 shadow-sm transition ' +
                    (isSelected ? 'border-blue-300 bg-white' : 'border-slate-200 bg-slate-50/60 opacity-75')
                  }
                >
                  <div className="flex items-center gap-3.5">
                    <button
                      onClick={() => toggleItemSelection(item.id)}
                      className="p-1 hover:opacity-80 transition"
                      aria-label="Toggle selection"
                    >
                      {isSelected ? (
                        <CheckSquare className="h-5 w-5 text-blue-600" />
                      ) : (
                        <Square className="h-5 w-5 text-slate-400" />
                      )}
                    </button>

                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-50 p-1 border border-slate-100">
                      <img
                        src={
                          item.product?.imageUrl ||
                          'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=300&auto=format&fit=crop&q=80'
                        }
                        alt={item.product?.title}
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 line-clamp-1">{item.product?.title}</h4>
                      <p className="text-sm font-bold text-slate-900 mt-1">
                        {Number(item.product?.price || 0).toLocaleString('en-IN', {
                          style: 'currency',
                          currency: 'INR',
                          maximumFractionDigits: 0,
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={isLoading}
                        className="p-1.5 text-slate-600 hover:text-slate-900 disabled:opacity-40"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-slate-900">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={isLoading}
                        className="p-1.5 text-slate-600 hover:text-slate-900 disabled:opacity-40"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.id)}
                      disabled={isLoading}
                      className="text-slate-400 hover:text-red-600 transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Price Summary & Book Now */}
          <div className="h-fit rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-4 space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Price Details</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Selected Items ({selectedItems.length})</span>
                <span>
                  {selectedSubtotal.toLocaleString('en-IN', {
                    style: 'currency',
                    currency: 'INR',
                    maximumFractionDigits: 0,
                  })}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Delivery Charges</span>
                <span className="text-emerald-600 font-semibold">FREE</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Payment Mode</span>
                <span className="text-amber-700 font-bold">Cash on Delivery</span>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3 flex justify-between text-base font-extrabold text-slate-950">
              <span>Total Payable</span>
              <span>
                {selectedSubtotal.toLocaleString('en-IN', {
                  style: 'currency',
                  currency: 'INR',
                  maximumFractionDigits: 0,
                })}
              </span>
            </div>

            <div className="flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 p-2.5 text-xs text-amber-900">
              <Banknote className="h-4 w-4 text-amber-700 shrink-0" />
              <span>Cash on Delivery active. Pay cash upon arrival.</span>
            </div>

            <button
              onClick={handleOpenBooking}
              disabled={selectedItems.length === 0}
              className={
                'flex w-full items-center justify-center gap-2 rounded-lg py-3 text-sm font-bold text-white shadow transition ' +
                (selectedItems.length === 0
                  ? 'cursor-not-allowed bg-slate-300 text-slate-500'
                  : 'bg-[#fb641b] hover:bg-[#e85a15]')
              }
            >
              {!isAuthenticated ? (
                <>
                  <LogIn className="h-4 w-4" />
                  <span>Sign In to Book Selected Items ({selectedItems.length})</span>
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 fill-current" />
                  <span>
                    {selectedItems.length === 0
                      ? 'Select Items to Book'
                      : 'Book Selected Items (' + selectedItems.length + ')'}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Book Now Address Modal */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <button
              onClick={() => setIsBookingModalOpen(false)}
              className="absolute right-4 top-4 rounded-full bg-slate-100 p-1.5 text-slate-500 hover:bg-slate-200"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Select Delivery Address</h3>
                <p className="text-xs text-slate-500">
                  Booking {selectedItems.length} selected item(s) - 5 to 7 days delivery
                </p>
              </div>
            </div>

            {savedAddress && !useNewAddress ? (
              <div className="mt-4 space-y-4">
                <div className="rounded-xl border-2 border-blue-600 bg-blue-50/50 p-4 relative">
                  <span className="absolute top-3 right-3 rounded bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white uppercase">
                    Saved Address
                  </span>
                  <div className="flex items-start gap-2.5">
                    <MapPin className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                    <div className="text-xs text-slate-800">
                      <p className="font-semibold text-slate-900">{savedAddress.address}</p>
                      <p className="text-slate-600 mt-0.5">
                        {savedAddress.city} - {savedAddress.pincode}
                      </p>
                      <p className="text-slate-600 mt-1">Phone: {savedAddress.phone}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setUseNewAddress(true)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700"
                  >
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span>Deliver to a different / new address</span>
                  </button>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleConfirmOrder}
                    disabled={isSubmitting}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#fb641b] py-3 text-sm font-bold text-white shadow hover:bg-[#e85a15] disabled:opacity-50 transition"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Zap className="h-4 w-4 fill-current" />
                        <span>Deliver to This Address & Confirm (COD)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleConfirmOrder} className="mt-4 space-y-3">
                {savedAddress && (
                  <div className="flex items-center justify-between pb-1">
                    <span className="text-xs font-semibold text-slate-700">Enter New Address</span>
                    <button
                      type="button"
                      onClick={() => setUseNewAddress(false)}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                    >
                      Back to saved address
                    </button>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Full Delivery Address</label>
                  <textarea
                    required
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="House/Flat No., Building Name, Street, Area..."
                    className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700">City / District</label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Bengaluru"
                      className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700">Pincode</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value.trim())}
                      placeholder="560001"
                      className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Contact Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.trim())}
                    placeholder="+91 98765 43210"
                    className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#fb641b] py-3 text-sm font-bold text-white shadow hover:bg-[#e85a15] disabled:opacity-50 transition"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Zap className="h-4 w-4 fill-current" />
                        <span>Save Address & Confirm Booking (COD)</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
