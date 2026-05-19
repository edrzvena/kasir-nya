import { useState } from 'react';
import { Minus, Plus, Trash2, QrCode, Banknote, ArrowRight, User, MessageSquare } from 'lucide-react';
import type { Product } from '../../lib/db';

interface CartItem {
  product: Product;
  quantity: number;
  note?: string;
}

interface CartDrawerProps {
  cart: CartItem[];
  onUpdateQty: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
  onUpdateNote: (productId: string, note: string) => void;
  selectedCustomerName: string;
  setSelectedCustomerName: (name: string) => void;
  paymentMethod: string;
  setPaymentMethod: (method: string) => void;
  onCheckout: () => void;
  totalAmount: number;
}

export default function CartDrawer({
  cart,
  onUpdateQty,
  onRemove,
  onUpdateNote,
  selectedCustomerName,
  setSelectedCustomerName,
  paymentMethod,
  setPaymentMethod,
  onCheckout,
  totalAmount
}: CartDrawerProps) {

  const [openNotes, setOpenNotes] = useState<Record<string, boolean>>({});

  const toggleNote = (id: string) => setOpenNotes(prev => ({ ...prev, [id]: !prev[id] }));
  const isNoteVisible = (item: CartItem) => openNotes[item.product.id] || !!item.note?.trim();

  const serviceTax = totalAmount * 0.1;
  const grandTotal = totalAmount + serviceTax;

  const paymentOptions = [
    { id: 'Cash', label: 'Cash', icon: Banknote },
    { id: 'QRIS', label: 'QRIS', icon: QrCode },
  ];

  return (
    <div className="w-full lg:w-96 bg-white border border-slate-100 rounded-3xl p-5 shadow-sm flex flex-col h-[calc(100vh-4rem)] sticky top-16 self-start">

      {/* ── HEADER ── */}
      <div className="flex justify-between items-center pb-3 border-b border-slate-50 shrink-0">
        <h3 className="font-bold text-slate-800 text-sm">Order Cart</h3>
        <span className="text-[10px] font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md uppercase">
          {cart.reduce((sum, item) => sum + item.quantity, 0)} Items
        </span>
      </div>

      {/* ── SCROLLABLE ITEMS ── */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-50 py-1 pr-1 mt-1 min-h-0">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 py-16">
            <span className="text-[10px] font-bold">Cart is empty</span>
            <p className="text-[9px] mt-1 text-center">Add menu to start checking out.</p>
          </div>
        ) : (
          cart.map((item) => (
            <div key={item.product.id} className="py-2.5">
              <div className="flex gap-2.5 items-center">
                <img
                  src={item.product.image_url}
                  alt={item.product.name}
                  className="h-10 w-10 object-cover rounded-xl border border-slate-50 shadow-inner shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold text-slate-750 block leading-tight truncate">{item.product.name}</span>
                  <span className="text-[10px] font-extrabold text-indigo-600 mt-0.5 block">
                    Rp {new Intl.NumberFormat('id-ID').format(item.product.price * item.quantity)}
                  </span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => onUpdateQty(item.product.id, item.quantity - 1)}
                    className="h-5 w-5 rounded-md border border-slate-100 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-400 cursor-pointer active:scale-95 transition-transform"
                  >
                    <Minus className="h-2.5 w-2.5" />
                  </button>
                  <span className="text-xs font-extrabold text-slate-800 w-4 text-center">{item.quantity}</span>
                  <button
                    onClick={() => onUpdateQty(item.product.id, item.quantity + 1)}
                    className="h-5 w-5 rounded-md border border-slate-100 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-400 cursor-pointer active:scale-95 transition-transform"
                  >
                    <Plus className="h-2.5 w-2.5" />
                  </button>
                  <button
                    onClick={() => toggleNote(item.product.id)}
                    title="Tambah catatan"
                    className={`h-5 w-5 rounded-md flex items-center justify-center cursor-pointer transition-colors ${
                      item.note?.trim()
                        ? 'bg-indigo-50 text-indigo-500'
                        : 'hover:bg-slate-50 text-slate-300 hover:text-slate-500'
                    }`}
                  >
                    <MessageSquare className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => onRemove(item.product.id)}
                    className="h-5 w-5 rounded-md hover:bg-rose-50 hover:text-rose-500 text-slate-300 flex items-center justify-center cursor-pointer transition-colors"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>

              {/* Note input */}
              {isNoteVisible(item) && (
                <input
                  type="text"
                  value={item.note || ''}
                  onChange={(e) => onUpdateNote(item.product.id, e.target.value)}
                  placeholder="Catatan... (contoh: less sugar, extra shot)"
                  className="w-full mt-1.5 bg-indigo-50/60 border border-indigo-100 rounded-lg px-3 py-1.5 text-[10px] font-medium text-indigo-800 placeholder:text-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-300 focus:border-indigo-300"
                />
              )}
            </div>
          ))
        )}
      </div>

      {/* ── RINGKASAN PESANAN ── */}
      {cart.length > 0 && (
        <div className="shrink-0 border-t border-slate-100 pt-2.5 pb-2 mt-1">
          <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Ringkasan</span>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {cart.map(item => (
              <span
                key={item.product.id}
                className="text-[9px] font-bold bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-lg text-slate-600 flex items-center gap-1"
              >
                {item.product.name}
                <span className="text-indigo-500 font-extrabold">×{item.quantity}</span>
                {item.note?.trim() && (
                  <span className="text-indigo-400 italic">· {item.note}</span>
                )}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── FOOTER ── */}
      <div className="shrink-0 border-t border-slate-50 pt-3 space-y-3 bg-white">

        {/* Customer name */}
        <div className="space-y-1">
          <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">
            Nama Customer <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <User className={`absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 ${selectedCustomerName.trim() ? 'text-indigo-500' : 'text-slate-400'}`} />
            <input
              type="text"
              required
              value={selectedCustomerName}
              onChange={(e) => setSelectedCustomerName(e.target.value)}
              placeholder="Ketik nama customer..."
              className={`w-full bg-slate-50 border rounded-xl pl-8 pr-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder:font-medium transition-all ${
                !selectedCustomerName.trim() ? 'border-rose-200 placeholder:text-rose-300' : 'border-slate-100 placeholder:text-slate-400'
              }`}
            />
          </div>
          {!selectedCustomerName.trim() && (
            <p className="text-[9px] text-rose-400 font-semibold">* Wajib diisi sebelum checkout</p>
          )}
        </div>

        {/* Payment method */}
        <div className="space-y-1.5">
          <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Payment Method</label>
          <div className="grid grid-cols-2 gap-2">
            {paymentOptions.map((opt) => {
              const Icon = opt.icon;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setPaymentMethod(opt.id)}
                  className={`flex items-center gap-2 rounded-xl p-2 border text-xs font-bold transition-all cursor-pointer active:scale-98 ${
                    paymentMethod === opt.id
                      ? 'border-indigo-400 bg-indigo-50/30 text-indigo-700 shadow-sm'
                      : 'border-slate-100 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Price breakdown */}
        <div className="bg-slate-50/50 border border-slate-100 px-3 py-2.5 rounded-2xl space-y-1.5">
          <div className="flex justify-between text-[10px] font-semibold text-slate-500">
            <span>Subtotal</span>
            <span>Rp {new Intl.NumberFormat('id-ID').format(totalAmount)}</span>
          </div>
          <div className="flex justify-between text-[10px] font-semibold text-slate-500">
            <span>PPN (10%)</span>
            <span>Rp {new Intl.NumberFormat('id-ID').format(Math.round(serviceTax))}</span>
          </div>
          <div className="flex justify-between text-xs font-extrabold text-slate-800 pt-1.5 border-t border-slate-100">
            <span>Grand Total</span>
            <span>Rp {new Intl.NumberFormat('id-ID').format(Math.round(grandTotal))}</span>
          </div>
        </div>

        {/* Checkout button */}
        <button
          onClick={onCheckout}
          disabled={cart.length === 0 || !selectedCustomerName.trim()}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-200 transition-all cursor-pointer hover:scale-[1.01]"
        >
          <span>{!selectedCustomerName.trim() ? 'Isi Nama Customer Dulu' : 'Bayar & Selesaikan Pesanan'}</span>
          <ArrowRight className="h-4 w-4" />
        </button>

      </div>
    </div>
  );
}
