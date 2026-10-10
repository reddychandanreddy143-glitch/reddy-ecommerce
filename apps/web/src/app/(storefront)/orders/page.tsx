'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';
import { InvoiceModal } from '@/components/orders/InvoiceModal';
import {
  Package,
  CheckCircle2,
  Truck,
  XCircle,
  Loader2,
  MapPin,
  Banknote,
  ArrowRight,
  RefreshCw,
  FileText,
} from 'lucide-react';

interface Order {
  id: string;
  userId: string;
  customerName?: string;
  customerEmail?: string;
  deliveryAddress?: string;
  paymentMethod?: string;
  productSummary?: string;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
}

export default function MyOrdersPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuthStore();
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);

  React.useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const {
    data: orders = [],
    isLoading,
    isRefetching,
    refetch,
  } = useQuery<Order[]>({
    queryKey: ['my-orders', user?.id || user?.email],
    queryFn: async () => {
      const res = await api.get('/orders/my-orders');
      return res.data;
    },
    enabled: !!isAuthenticated && !!user,
  });

  const cancelMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const res = await api.patch(`/orders/${orderId}/cancel`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-orders', user?.id || user?.email] });
      setCancellingId(null);
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Failed to cancel order.');
      setCancellingId(null);
    },
  });

  const handleCancel = (orderId: string) => {
    if (confirm('Are you sure you want to cancel this order? An email notification will be sent.')) {
      setCancellingId(orderId);
      cancelMutation.mutate(orderId);
    }
  };

  const getStatusStep = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 1;
      case 'shipped':
        return 2;
      case 'delivered':
        return 3;
      case 'cancelled':
        return -1;
      default:
        return 1;
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Invoice Modal */}
      <InvoiceModal order={selectedInvoiceOrder} onClose={() => setSelectedInvoiceOrder(null)} />

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">My Orders</h1>
          <p className="mt-1 text-xs text-slate-500">
            Account: <span className="font-semibold text-slate-700">{user?.name}</span> ({user?.email})
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            disabled={isLoading || isRefetching}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefetching ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
          >
            Browse Products
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      ) : orders.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <Package className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-3 text-base font-semibold text-slate-900">No Orders Yet</h3>
          <p className="mt-1 text-xs text-slate-500">
            You haven't placed any bookings on this account ({user?.email}).
          </p>
          <div className="mt-6">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-indigo-700"
            >
              Start Shopping <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          {orders.map((order) => {
            const step = getStatusStep(order.status);
            const isCancelled = order.status === 'cancelled';

            return (
              <div
                key={order.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
              >
                {/* Order Card Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/75 px-5 py-3.5 text-xs">
                  <div className="flex items-center gap-4">
                    <div>
                      <span className="text-slate-400">Order ID</span>
                      <p className="font-mono font-bold text-slate-900">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </p>
                    </div>
                    <div className="h-6 w-px bg-slate-200" />
                    <div>
                      <span className="text-slate-400">Date</span>
                      <p className="font-semibold text-slate-700">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm font-extrabold text-slate-900">
                      {Number(order.totalAmount).toLocaleString('en-IN', {
                        style: 'currency',
                        currency: 'INR',
                        maximumFractionDigits: 0,
                      })}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        isCancelled
                          ? 'bg-rose-100 text-rose-700'
                          : order.status === 'delivered'
                          ? 'bg-emerald-100 text-emerald-700'
                          : order.status === 'shipped'
                          ? 'bg-sky-100 text-sky-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>

                {/* Tracking Progress Bar */}
                {!isCancelled ? (
                  <div className="border-b border-slate-100 bg-white px-6 py-5">
                    <div className="relative flex items-center justify-between">
                      <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-slate-100 -z-0">
                        <div
                          className="h-full bg-indigo-600 transition-all duration-500"
                          style={{
                            width: step === 1 ? '15%' : step === 2 ? '60%' : '100%',
                          }}
                        />
                      </div>

                      {/* Step 1: Confirmed */}
                      <div className="relative z-10 flex flex-col items-center">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-white shadow">
                          <CheckCircle2 className="h-4 w-4" />
                        </div>
                        <span className="mt-1 text-[11px] font-bold text-indigo-700">Confirmed</span>
                      </div>

                      {/* Step 2: Shipped */}
                      <div className="relative z-10 flex flex-col items-center">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full shadow ${
                            step >= 2 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'
                          }`}
                        >
                          <Truck className="h-4 w-4" />
                        </div>
                        <span
                          className={`mt-1 text-[11px] font-semibold ${
                            step >= 2 ? 'text-indigo-700 font-bold' : 'text-slate-400'
                          }`}
                        >
                          Shipped
                        </span>
                      </div>

                      {/* Step 3: Delivered */}
                      <div className="relative z-10 flex flex-col items-center">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full shadow ${
                            step >= 3 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
                          }`}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </div>
                        <span
                          className={`mt-1 text-[11px] font-semibold ${
                            step >= 3 ? 'text-emerald-700 font-bold' : 'text-slate-400'
                          }`}
                        >
                          Delivered
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 border-b border-rose-100 bg-rose-50/60 px-6 py-3 text-xs text-rose-700">
                    <XCircle className="h-4 w-4 text-rose-600 shrink-0" />
                    <span>This order was cancelled. No payment or delivery is required.</span>
                  </div>
                )}

                {/* Items and Details */}
                <div className="p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        {order.productSummary || 'Store Product Item'}
                      </h4>
                      <div className="mt-2 space-y-1 text-xs text-slate-600">
                        <div className="flex items-start gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <span>{order.deliveryAddress || 'Standard Delivery Address'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Banknote className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                          <span className="font-semibold text-slate-800">
                            {order.paymentMethod || 'Cash on Delivery (COD)'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start">
                      {!isCancelled && (
                        <button
                          onClick={() => setSelectedInvoiceOrder(order)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition"
                        >
                          <FileText className="h-3.5 w-3.5 text-indigo-600" />
                          <span>Invoice</span>
                        </button>
                      )}

                      {!isCancelled && order.status !== 'delivered' && (
                        <button
                          onClick={() => handleCancel(order.id)}
                          disabled={cancellingId === order.id}
                          className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-50 transition"
                        >
                          {cancellingId === order.id ? (
                            <span className="inline-flex items-center gap-1">
                              <Loader2 className="h-3 w-3 animate-spin" /> Cancelling...
                            </span>
                          ) : (
                            'Cancel Order'
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
