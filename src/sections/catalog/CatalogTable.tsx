import { Plus, Minus, Edit3, Trash2, ImageOff } from 'lucide-react';
import { useState } from 'react';
import type { Product, Category } from '../../lib/db';

interface CatalogTableProps {
  products: Product[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
  onStockChange: (productId: string, newStock: number) => void;
  onEditClick: (product: Product) => void;
  onDeleteClick: (productId: string) => void;
  categories?: Category[];
}

function TableImage({ src, alt }: { src: string; alt: string }) {
  const [error, setError] = useState(false);
  if (!src || error) {
    return (
      <div className="h-11 w-11 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-center shrink-0">
        <ImageOff className="h-4 w-4 text-slate-300" />
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      onError={() => setError(true)}
      className="h-11 w-11 object-cover rounded-xl border border-slate-100 shadow-sm shrink-0"
    />
  );
}

export default function CatalogTable({
  products,
  onStockChange,
  onEditClick,
  onDeleteClick,
  categories = []
}: CatalogTableProps) {

  // Status badge colors
  const getStatusStyle = (product: Product) => {
    if (product.stock_quantity === 0) return 'bg-rose-50 text-rose-600';
    if (product.stock_status === 'Low Stock') return 'bg-amber-50 text-amber-600';
    return 'bg-emerald-50 text-emerald-600';
  };

  return (
    <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-slate-50 bg-slate-50/50 text-[10px] font-bold text-slate-400 tracking-wider uppercase">
              <th className="px-6 py-4">Item Details</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Unit Price</th>
              <th className="px-6 py-4 text-center">Stock Count</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {products.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center text-slate-400">
                  <p className="font-bold text-xs">No products found</p>
                  <p className="text-[10px] text-slate-300 mt-1">Try adjusting your search or category filter.</p>
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/30 transition-colors group">

                  {/* Details with image */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <TableImage src={p.image_url} alt={p.name} />
                      <div>
                        <span className="text-xs font-bold text-slate-800 block leading-tight">{p.name}</span>
                        <span className="text-[10px] text-slate-400 font-medium block mt-1 line-clamp-1 max-w-[200px]">{p.description}</span>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="px-6 py-4">
                    <span className="text-xs font-semibold text-slate-600 inline-flex items-center gap-1.5">
                      <span className="text-sm">
                        {categories.find(c => c.name === p.category)?.emoji || '📦'}
                      </span>
                      {p.category}
                    </span>
                  </td>

                  {/* Price */}
                  <td className="px-6 py-4 text-xs font-extrabold text-slate-800">
                    Rp {new Intl.NumberFormat('id-ID').format(p.price)}
                  </td>

                  {/* Stock Counter controls */}
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => onStockChange(p.id, p.stock_quantity - 1)}
                        className="h-7 w-7 rounded-lg border border-slate-100 hover:bg-slate-50 flex items-center justify-center text-slate-400 cursor-pointer active:scale-90 transition-all"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="text-xs font-extrabold text-slate-800 w-7 text-center tabular-nums">
                        {p.stock_quantity}
                      </span>
                      <button
                        onClick={() => onStockChange(p.id, p.stock_quantity + 1)}
                        className="h-7 w-7 rounded-lg border border-slate-100 hover:bg-slate-50 flex items-center justify-center text-slate-400 cursor-pointer active:scale-90 transition-all"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </td>

                  {/* Stock Status badges */}
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${getStatusStyle(p)}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${p.stock_quantity === 0 ? 'bg-rose-500' :
                          p.stock_status === 'Low Stock' ? 'bg-amber-500' : 'bg-emerald-500'
                        }`} />
                      {p.stock_quantity === 0 ? 'Out of Stock' : p.stock_status}
                    </span>
                  </td>

                  {/* Action buttons */}
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => onEditClick(p)}
                        className="h-8 w-8 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 flex items-center justify-center text-slate-400 cursor-pointer transition-all shadow-xs"
                        title="Edit product"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDeleteClick(p.id)}
                        className="h-8 w-8 rounded-xl border border-slate-100 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 flex items-center justify-center text-slate-400 cursor-pointer transition-all shadow-xs"
                        title="Delete product"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>

                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
