import { Minus, Plus, Trash2, QrCode, Banknote, ArrowRight, User } from 'lucide-react';
import type { Product } from '../../lib/db';

interface CartItem {
  product: Product;
  quantity: number;
}

interface CartDrawerProps {
  cart: CartItem[];
  onUpdateQty: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
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
  selectedCustomerName,
  setSelectedCustomerName,
  paymentMethod,
  setPaymentMethod,
  onCheckout,
  totalAmount
}: CartDrawerProps) {

  // Cart summary formulas
  const serviceTax = totalAmount * 0.1;
  const grandTotal = totalAmount + serviceTax;

  const paymentOptions = [
    { id: 'Cash', label: 'Cash', icon: Banknote },
    { id: 'QRIS', label: 'QRIS', icon: QrCode },
  ];

  return (
    <div className="w-full lg:w-96 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between h-[calc(100vh-10rem)] sticky top-28 overflow-y-auto">

      {/* Cart Items List */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex justify-between items-center pb-4 border-b border-slate-50 shrink-0">
          <h3 className="font-bold text-slate-800 text-sm">Order Cart</h3>
          <span className="text-[10px] font-extrabold text-indigo-650 bg-indigo-50 px-2 py-0.5 rounded-md uppercase">
            {cart.reduce((sum, item) => sum + item.quantity, 0)} Items
          </span>
        </div>

        {/* Scrollable item stack */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-50 py-2 pr-1 space-y-2 mt-2">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 py-16">
              <span className="text-[10px] font-bold">Cart is empty</span>
              <p className="text-[9px] mt-1 text-slate-400 text-center">Add menu drinks to start checking out.</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.product.id} className="flex gap-3 py-3 items-center group">
                <img
                  src={item.product.image_url}
                  alt={item.product.name}
                  className="h-11 w-11 object-cover rounded-xl border border-slate-50 shadow-inner"
                />

                <div className="flex-1">
                  <span className="text-xs font-bold text-slate-750 block leading-tight">{item.product.name}</span>
                  <span className="text-[10px] font-extrabold text-indigo-600 mt-1 block">Rp {new Intl.NumberFormat('id-ID').format(item.product.price * item.quantity)}</span>
                </div>

                {/* Counter control */}
                <div className="flex items-center gap-2">
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

                  {/* Delete button */}
                  <button
                    onClick={() => onRemove(item.product.id)}
                    className="h-6 w-6 rounded-md hover:bg-rose-50 hover:text-rose-600 text-slate-300 flex items-center justify-center cursor-pointer transition-colors ml-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Cart Total & Checkout Footer */}
      <div className="border-t border-slate-50 pt-5 space-y-4 shrink-0 bg-white">

        {/* Customer Name Input (REQUIRED) */}
        <div className="space-y-1.5">
          <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">
            Nama Customer <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <User className={`absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 ${selectedCustomerName.trim() ? 'text-indigo-500' : 'text-slate-400'}`} />
            <input
              type="text"
              required
              value={selectedCustomerName}
              onChange={(e) => setSelectedCustomerName(e.target.value)}
              placeholder="Wajib diisi — ketik nama customer..."
              className={`w-full bg-slate-50 border rounded-xl pl-9 pr-3 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder:font-medium transition-all ${
                !selectedCustomerName.trim() ? 'border-rose-200 placeholder:text-rose-300' : 'border-slate-100 placeholder:text-slate-400'
              }`}
            />
          </div>
          {!selectedCustomerName.trim() && (
            <p className="text-[9px] text-rose-400 font-semibold">* Nama customer harus diisi sebelum checkout</p>
          )}
        </div>

        {/* Payment selector grid */}
        <div className="space-y-2">
          <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Payment Method</label>
          <div className="grid grid-cols-2 gap-2">
            {paymentOptions.map((opt) => {
              const Icon = opt.icon;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setPaymentMethod(opt.id)}
                  className={`flex items-center gap-2 rounded-xl p-2.5 border text-xs font-bold transition-all cursor-pointer hover:bg-slate-50 active:scale-98 ${paymentMethod === opt.id
                      ? 'border-indigo-650 bg-indigo-50/20 text-indigo-700 shadow-sm'
                      : 'border-slate-100 bg-white text-slate-600'
                    }`}
                >
                  <Icon className="h-4 w-4 shrink-0 text-slate-400" />
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Price layout math */}
        <div className="space-y-2 bg-slate-50/50 border border-slate-50 p-3 rounded-2xl">
          <div className="flex justify-between text-[11px] font-semibold text-slate-500">
            <span>Subtotal</span>
            <span>Rp {new Intl.NumberFormat('id-ID').format(totalAmount)}</span>
          </div>
          <div className="flex justify-between text-[11px] font-semibold text-slate-500">
            <span>PPN (10%)</span>
            <span>Rp {new Intl.NumberFormat('id-ID').format(Math.round(serviceTax))}</span>
          </div>
          <div className="flex justify-between text-xs font-extrabold text-slate-800 pt-2 border-t border-slate-100">
            <span>Grand Total</span>
            <span>Rp {new Intl.NumberFormat('id-ID').format(Math.round(grandTotal))}</span>
          </div>
        </div>

        {/* Place Order Trigger */}
        <button
          onClick={onCheckout}
          disabled={cart.length === 0 || !selectedCustomerName.trim()}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-155 transition-all cursor-pointer hover:scale-[1.01]"
        >
          <span>{!selectedCustomerName.trim() ? 'Isi Nama Customer Dulu' : 'Bayar & Selesaikan Pesanan'}</span>
          <ArrowRight className="h-4 w-4" />
        </button>

      </div>

    </div>
  );
}
