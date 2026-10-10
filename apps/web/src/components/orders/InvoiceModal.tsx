'use client';

import React from 'react';
import { Printer, Download, X, Package, ShieldCheck } from 'lucide-react';

interface Order {
  id: string;
  customerName?: string;
  customerEmail?: string;
  deliveryAddress?: string;
  paymentMethod?: string;
  productSummary?: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}

interface InvoiceModalProps {
  order: Order | null;
  onClose: () => void;
}

export function InvoiceModal({ order, onClose }: InvoiceModalProps) {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const invoiceNumber = `INV-${order.id.slice(0, 8).toUpperCase()}`;
  const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const rawAmount = Number(order.totalAmount);
  // Break down into Subtotal (excl. 18% GST) and GST
  const subTotal = rawAmount / 1.18;
  const gstAmount = rawAmount - subTotal;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm print:p-0 print:bg-white">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl print:max-w-none print:shadow-none print:p-8">
        {/* Action Bar (hidden in print) */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 print:hidden">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">Tax Invoice Preview</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow hover:bg-indigo-700 transition"
            >
              <Printer className="h-4 w-4" /> Print / Save as PDF
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Container */}
        <div id="invoice-printable" className="mt-4 text-xs text-slate-800">
          {/* Brand & Invoice Header */}
          <div className="flex justify-between items-start border-b border-slate-200 pb-5">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">REDDY STORE</h1>
              <p className="text-[11px] text-slate-500 mt-0.5">E-Commerce Retail & Electronics</p>
              <p className="text-[11px] text-slate-500">GSTIN: 29ABCDE1234F1Z5</p>
              <p className="text-[11px] text-slate-500">Bengaluru, Karnataka, India</p>
            </div>
            <div className="text-right">
              <span className="inline-block rounded border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700 uppercase tracking-wide">
                TAX INVOICE
              </span>
              <p className="font-mono font-bold text-slate-900 mt-2 text-sm">{invoiceNumber}</p>
              <p className="text-slate-500 mt-0.5">Date: {orderDate}</p>
              <p className="text-slate-500">Status: <span className="font-semibold uppercase text-emerald-600">{order.status}</span></p>
            </div>
          </div>

          {/* Customer & Shipping Details */}
          <div className="grid grid-cols-2 gap-4 py-4 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 uppercase text-[10px] tracking-wider text-slate-400">
                Billed & Shipped To:
              </h3>
              <p className="font-semibold text-slate-900 mt-1">{order.customerName || 'Customer'}</p>
              <p className="text-slate-600 mt-0.5">{order.customerEmail || 'N/A'}</p>
              <p className="text-slate-600 mt-0.5 whitespace-pre-line">{order.deliveryAddress}</p>
            </div>
            <div className="text-right">
              <h3 className="font-bold text-slate-900 uppercase text-[10px] tracking-wider text-slate-400">
                Payment Information:
              </h3>
              <p className="font-semibold text-slate-900 mt-1">{order.paymentMethod || 'Cash on Delivery'}</p>
              <p className="text-slate-600 mt-0.5">Currency: INR (₹)</p>
              <p className="text-slate-600 mt-0.5">Order ID: #{order.id.slice(0, 8).toUpperCase()}</p>
            </div>
          </div>

          {/* Line Items Table */}
          <table className="w-full mt-4 border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-700">
                <th className="py-2.5 text-left pl-2">Item Description</th>
                <th className="py-2.5 text-center">Qty</th>
                <th className="py-2.5 text-right">Taxable Value</th>
                <th className="py-2.5 text-right pr-2">Total Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              <tr>
                <td className="py-3 pl-2 font-medium text-slate-900">{order.productSummary || 'Store Catalog Product'}</td>
                <td className="py-3 text-center font-semibold text-slate-700">1</td>
                <td className="py-3 text-right text-slate-700">₹{subTotal.toFixed(2)}</td>
                <td className="py-3 text-right pr-2 font-bold text-slate-900">₹{rawAmount.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          {/* Total Breakdown */}
          <div className="mt-4 flex justify-end border-t border-slate-200 pt-3">
            <div className="w-64 space-y-1.5 text-right">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal (Excl. Tax):</span>
                <span>₹{subTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>IGST / CGST+SGST (18%):</span>
                <span>₹{gstAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Shipping Charges:</span>
                <span className="font-semibold text-emerald-600">FREE</span>
              </div>
              <div className="flex justify-between border-t border-slate-300 pt-2 text-sm font-extrabold text-slate-950">
                <span>Grand Total:</span>
                <span>₹{rawAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Footer Notes */}
          <div className="mt-8 border-t border-slate-200 pt-4 flex items-center justify-between text-[11px] text-slate-500">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Authorized Computer-Generated Invoice. No physical signature required.</span>
            </div>
            <div>
              <span>Thank you for shopping at Reddy Store!</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}