import { useState, useEffect, type FormEvent } from 'react';
import { dbService } from '../../lib/db';
import type { Product } from '../../lib/db';
import Modal from '../ui/Modal';

interface EditStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  product: Product | null;
  storeId: number;
}

export default function EditStockModal({
  isOpen,
  onClose,
  onSuccess,
  product,
  storeId
}: EditStockModalProps) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Coffee');
  const [desc, setDesc] = useState('');
  const [qty, setQty] = useState('');
  const [imgUrl, setImgUrl] = useState('');

  // Sync inputs with selected product and pre-format price as Rupiah with dots
  useEffect(() => {
    if (product) {
      setName(product.name);
      setPrice(new Intl.NumberFormat('id-ID').format(product.price));
      setCategory(product.category);
      setDesc(product.description);
      setQty(product.stock_quantity.toString());
      setImgUrl(product.image_url);
    }
  }, [product]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!product || !name || !price) return;

    // Convert Rupiah with dots back to a raw number
    const priceNum = parseFloat(price.replace(/\./g, '')) || 0;
    const qtyNum = parseInt(qty) || 0;
    const status = qtyNum === 0 ? 'Out of Stock' : qtyNum <= 5 ? 'Low Stock' : 'In Stock';

    await dbService.updateProduct(product.id, {
      name,
      description: desc,
      price: priceNum,
      image_url: imgUrl,
      category,
      stock_status: status,
      stock_quantity: qtyNum
    }, storeId);

    onSuccess();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Menu Product"
      description="Update catalog details and inventory stock counts."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-[9px] font-bold text-slate-400 tracking-wider uppercase block mb-1.5">Product Name</label>
          <input 
            type="text" 
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-slate-50 border border-slate-150 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-805 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-650"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[9px] font-bold text-slate-400 tracking-wider uppercase block mb-1.5">Price (Rupiah / Rp)</label>
            <input 
              type="text" 
              required
              value={price}
              onChange={(e) => {
                // Keep only numbers and format as Indonesian Rupiah thousands separator
                const digits = e.target.value.replace(/\D/g, '');
                if (!digits) {
                  setPrice('');
                } else {
                  setPrice(new Intl.NumberFormat('id-ID').format(parseInt(digits)));
                }
              }}
              className="w-full bg-slate-50 border border-slate-150 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-805 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-655"
            />
          </div>
          <div>
            <label className="text-[9px] font-bold text-slate-400 tracking-wider uppercase block mb-1.5">Stock Quantity</label>
            <input 
              type="number" 
              required
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              className="w-full bg-slate-50 border border-slate-150 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-805 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-655"
            />
          </div>
        </div>

        <div>
          <label className="text-[9px] font-bold text-slate-400 tracking-wider uppercase block mb-1.5">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-slate-50 border border-slate-150 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-855 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-655"
          >
            <option value="Coffee">☕ Coffee</option>
            <option value="Non-Coffee">🌸 Non-Coffee</option>
            <option value="Food">🥗 Food</option>
            <option value="Pastries">🥐 Pastries</option>
          </select>
        </div>

        <div>
          <label className="text-[9px] font-bold text-slate-400 tracking-wider uppercase block mb-1.5">Product Image URL</label>
          <input 
            type="url" 
            required
            value={imgUrl}
            onChange={(e) => setImgUrl(e.target.value)}
            className="w-full bg-slate-50 border border-slate-150 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-805 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-655"
          />
        </div>

        <div>
          <label className="text-[9px] font-bold text-slate-400 tracking-wider uppercase block mb-1.5">Description</label>
          <textarea 
            rows={2}
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            className="w-full bg-slate-50 border border-slate-150 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-805 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-655 resize-none"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl mt-4 cursor-pointer shadow-md shadow-indigo-155"
        >
          Save Changes
        </button>
      </form>
    </Modal>
  );
}
