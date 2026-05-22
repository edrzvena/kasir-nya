import { AlertTriangle, PackageX } from 'lucide-react';
import type { Product } from '../../lib/db';

interface Props {
  products: Product[];
  threshold?: number;
}

export default function LowStockAlert({ products, threshold = 5 }: Props) {
  const lowStock = products
    .filter(p => p.stock_quantity <= threshold)
    .sort((a, b) => a.stock_quantity - b.stock_quantity);

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
      <div className="flex justify-between items-start mb-5">
        <div>
          <h4 className="font-bold text-slate-800 text-sm leading-none">Stok Tipis</h4>
          <p className="text-[10px] text-slate-400 font-medium mt-1">Produk dengan stok ≤ {threshold} unit</p>
        </div>
        <div className="h-8 w-8 bg-rose-50 rounded-xl flex items-center justify-center">
          <AlertTriangle className="h-4 w-4 text-rose-500" />
        </div>
      </div>

      {lowStock.length === 0 ? (
        <div className="py-8 text-center">
          <div className="h-12 w-12 mx-auto bg-emerald-50 rounded-full flex items-center justify-center mb-3">
            <PackageX className="h-5 w-5 text-emerald-500" />
          </div>
          <p className="text-xs font-bold text-slate-600">Semua stok aman</p>
          <p className="text-[10px] text-slate-400 font-medium mt-1">Tidak ada produk dengan stok kritis</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[280px] overflow-y-auto -mx-2 px-2">
          {lowStock.map(p => {
            const isOut = p.stock_quantity === 0;
            return (
              <div
                key={p.id}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                  isOut
                    ? 'bg-rose-50/60 border-rose-100'
                    : 'bg-amber-50/40 border-amber-100/60'
                }`}
              >
                <div className={`h-10 w-10 rounded-lg overflow-hidden bg-white border ${isOut ? 'border-rose-100' : 'border-amber-100'} shrink-0`}>
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-slate-300">
                      <PackageX className="h-4 w-4" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate">{p.name}</p>
                  <p className="text-[10px] text-slate-400 font-medium truncate">{p.category}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className={`block text-base font-extrabold leading-none ${isOut ? 'text-rose-600' : 'text-amber-600'}`}>
                    {p.stock_quantity}
                  </span>
                  <span className={`text-[9px] font-bold uppercase tracking-wider ${isOut ? 'text-rose-500' : 'text-amber-500'}`}>
                    {isOut ? 'Habis' : 'unit'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
