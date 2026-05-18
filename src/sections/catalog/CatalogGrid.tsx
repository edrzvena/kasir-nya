import { Edit3, Trash2, Plus, Minus, ImageOff } from 'lucide-react';
import { useState } from 'react';
import type { Product, Category } from '../../lib/db';

interface CatalogGridProps {
  products: Product[];
  onStockChange: (productId: string, newStock: number) => void;
  onEditClick: (product: Product) => void;
  onDeleteClick: (productId: string) => void;
  categories?: Category[];
}



// Status badge color mapping
const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
  'In Stock': { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  'Low Stock': { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  'Out of Stock': { bg: 'bg-rose-50', text: 'text-rose-700', dot: 'bg-rose-500' },
};

function ProductCard({ product, onStockChange, onEditClick, onDeleteClick, categories }: {
  product: Product;
  onStockChange: (productId: string, newStock: number) => void;
  onEditClick: (product: Product) => void;
  onDeleteClick: (productId: string) => void;
  categories: Category[];
}) {
  const [imgError, setImgError] = useState(false);
  const displayStatus = product.stock_quantity === 0 ? 'Out of Stock' : product.stock_status;
  const colors = statusColors[displayStatus] || statusColors['In Stock'];

  return (
    <div className="group bg-white border border-slate-100/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-slate-200/50 hover:border-slate-200/80 transition-all duration-300 flex flex-col hover:-translate-y-0.5">

      {/* Product Image */}
      <div className="relative h-44 bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden">
        {product.image_url && !imgError ? (
          <img
            src={product.image_url}
            alt={product.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-2">
            <ImageOff className="h-8 w-8" />
            <span className="text-[10px] font-bold uppercase tracking-wider">No Image</span>
          </div>
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-[10px] font-bold text-slate-700 shadow-sm">
            <span>{categories.find(c => c.name === product.category)?.emoji || '📦'}</span>
            <span>{product.category}</span>
          </span>
        </div>

        {/* Action buttons (top-right, visible on hover) */}
        <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-1 group-hover:translate-y-0">
          <button
            onClick={() => onEditClick(product)}
            className="h-8 w-8 bg-white/90 backdrop-blur-sm rounded-lg flex items-center justify-center text-slate-500 hover:text-indigo-600 cursor-pointer transition-colors shadow-sm hover:shadow-md"
            title="Edit product"
          >
            <Edit3 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onDeleteClick(product.id)}
            className="h-8 w-8 bg-white/90 backdrop-blur-sm rounded-lg flex items-center justify-center text-slate-500 hover:text-rose-600 cursor-pointer transition-colors shadow-sm hover:shadow-md"
            title="Delete product"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Title & Description */}
        <h3 className="text-sm font-extrabold text-slate-800 leading-tight mb-1 line-clamp-1">{product.name}</h3>
        <p className="text-[11px] text-slate-400 font-medium leading-relaxed line-clamp-2 mb-3">{product.description}</p>

        {/* Price */}
        <div className="mb-3 mt-auto">
          <span className="text-lg font-extrabold text-slate-800">
            Rp {new Intl.NumberFormat('id-ID').format(product.price)}
          </span>
        </div>

        {/* Stock Status + Controls */}
        <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-50">
          {/* Status Badge */}
          <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${colors.bg} ${colors.text}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${colors.dot}`} />
            {displayStatus}
          </span>

          {/* Stock counter */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onStockChange(product.id, product.stock_quantity - 1)}
              className="h-7 w-7 rounded-lg border border-slate-150 hover:border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-400 cursor-pointer active:scale-90 transition-all"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="text-xs font-extrabold text-slate-800 w-7 text-center tabular-nums">
              {product.stock_quantity}
            </span>
            <button
              onClick={() => onStockChange(product.id, product.stock_quantity + 1)}
              className="h-7 w-7 rounded-lg border border-slate-150 hover:border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-400 cursor-pointer active:scale-90 transition-all"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CatalogGrid({ products, onStockChange, onEditClick, onDeleteClick, categories = [] }: CatalogGridProps) {
  if (products.length === 0) {
    return (
      <div className="bg-white border border-slate-100 rounded-3xl p-16 text-center">
        <div className="mx-auto h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
          <ImageOff className="h-7 w-7 text-slate-300" />
        </div>
        <p className="font-bold text-sm text-slate-400">No products found</p>
        <p className="text-xs text-slate-300 mt-1 font-medium">Try adjusting your search or category filter.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onStockChange={onStockChange}
          onEditClick={onEditClick}
          onDeleteClick={onDeleteClick}
          categories={categories}
        />
      ))}
    </div>
  );
}
