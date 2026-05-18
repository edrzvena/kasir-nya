import { useState, useRef, type FormEvent, type ChangeEvent } from 'react';
import { dbService } from '../../lib/db';
import type { Category } from '../../lib/db';
import { ImagePlus, Link, Upload, X, Image as ImageIcon, AlertCircle, Loader2 } from 'lucide-react';
import Modal from '../ui/Modal';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  storeId: number;
  categories?: Category[];
}

type ImageInputMode = 'url' | 'upload';

export default function AddProductModal({ isOpen, onClose, onSuccess, storeId, categories = [] }: AddProductModalProps) {
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductCategory, setNewProductCategory] = useState(categories.length > 0 ? categories[0].name : '');
  const [newProductDesc, setNewProductDesc] = useState('');
  const [newProductQty, setNewProductQty] = useState('20');

  // Image handling
  const [imageMode, setImageMode] = useState<ImageInputMode>('url');
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Submit state
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setNewProductName('');
    setNewProductPrice('');
    setNewProductDesc('');
    setNewProductQty('20');
    setNewProductCategory(categories.length > 0 ? categories[0].name : '');
    setImageUrl('');
    setImagePreview(null);
    setImageMode('url');
    setSubmitError('');
  };

  // Convert uploaded file to base64 data URL for storage
  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Image file size must be under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setImagePreview(result);
      setImageUrl(result); // Store base64 as the image_url
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
  };

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) handleFileUpload(file);
  };

  const handleUrlChange = (url: string) => {
    setImageUrl(url);
    if (url.match(/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|svg|avif)/i) || url.match(/^https?:\/\/(images\.unsplash|i\.imgur)/i)) {
      setImagePreview(url);
    } else if (url.length > 10) {
      // Try loading even non-standard URLs
      setImagePreview(url);
    } else {
      setImagePreview(null);
    }
  };

  const clearImage = () => {
    setImageUrl('');
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAddSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!newProductName || !newProductPrice) return;

    setSubmitError('');
    setIsSubmitting(true);

    try {
      const priceNum = parseFloat(newProductPrice.replace(/\./g, '')) || 0;
      const stockQty = parseInt(newProductQty) || 0;
      const stockStatus = stockQty === 0 ? 'Out of Stock' : stockQty <= 5 ? 'Low Stock' : 'In Stock';
      const finalImageUrl = imageUrl || getCategoryDefaultImage(newProductCategory);
      const effectiveCategory = newProductCategory || (categories.length > 0 ? categories[0].name : 'Umum');

      await dbService.addProduct({
        name: newProductName,
        description: newProductDesc || 'Fresh handcrafted artisan selection.',
        price: priceNum,
        image_url: finalImageUrl,
        category: effectiveCategory,
        stock_status: stockStatus,
        stock_quantity: stockQty
      }, storeId);

      resetForm();
      onSuccess();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Gagal menyimpan produk. Coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => { resetForm(); onClose(); }}
      title="Add New Product"
      description="Create a new product item for your catalog with details and imagery."
      maxWidth="md"
    >
      <form onSubmit={handleAddSubmit} className="space-y-5">

        {/* IMAGE UPLOAD SECTION */}
        <div>
          <label className="text-[9px] font-bold text-slate-400 tracking-wider uppercase block mb-2">Product Image</label>

          {/* Mode Toggle */}
          <div className="flex bg-slate-50 border border-slate-100 p-0.5 rounded-xl mb-3 w-fit">
            <button
              type="button"
              onClick={() => { setImageMode('url'); clearImage(); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${imageMode === 'url'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-400 hover:text-slate-600'
                }`}
            >
              <Link className="h-3 w-3" />
              Image URL
            </button>
            <button
              type="button"
              onClick={() => { setImageMode('upload'); clearImage(); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${imageMode === 'upload'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-400 hover:text-slate-600'
                }`}
            >
              <Upload className="h-3 w-3" />
              Upload File
            </button>
          </div>

          {/* Image Preview + Input */}
          <div className="flex gap-3">
            {/* Preview Box */}
            <div className="relative h-24 w-24 shrink-0 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border-2 border-dashed border-slate-200 overflow-hidden flex items-center justify-center">
              {imagePreview ? (
                <>
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" onError={() => setImagePreview(null)} />
                  <button
                    type="button"
                    onClick={clearImage}
                    className="absolute top-1 right-1 h-5 w-5 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white cursor-pointer hover:bg-black/70 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </>
              ) : (
                <div className="text-slate-300 flex flex-col items-center gap-1">
                  <ImageIcon className="h-6 w-6" />
                  <span className="text-[8px] font-bold uppercase tracking-wider">Preview</span>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="flex-1 min-w-0">
              {imageMode === 'url' ? (
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={imageUrl}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-150 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder:text-slate-300"
                />
              ) : (
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full border-2 border-dashed rounded-xl px-4 py-4 text-center cursor-pointer transition-all ${dragActive
                    ? 'border-indigo-400 bg-indigo-50/50'
                    : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100/50'
                    }`}
                >
                  <ImagePlus className={`h-5 w-5 mx-auto mb-1.5 ${dragActive ? 'text-indigo-500' : 'text-slate-300'}`} />
                  <p className="text-[10px] font-bold text-slate-400">
                    {dragActive ? 'Drop image here' : 'Click or drag & drop'}
                  </p>
                  <p className="text-[9px] text-slate-300 mt-0.5 font-medium">PNG, JPG, WebP (max 5MB)</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <p className="text-[9px] text-slate-300 mt-1.5 font-medium">
                {imageMode === 'url' ? 'Paste any image URL from the web' : 'Upload a product photo from your device'}
              </p>
            </div>
          </div>
        </div>

        {/* PRODUCT NAME */}
        <div>
          <label className="text-[9px] font-bold text-slate-400 tracking-wider uppercase block mb-1.5">Product Name</label>
          <input
            type="text"
            required
            placeholder="e.g. Vanilla Beans Espresso"
            value={newProductName}
            onChange={(e) => setNewProductName(e.target.value)}
            className="w-full bg-slate-50 border border-slate-150 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        {/* PRICE & STOCK */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[9px] font-bold text-slate-400 tracking-wider uppercase block mb-1.5">Price (Rp)</label>
            <input
              type="text"
              required
              placeholder="e.g. 15.000"
              value={newProductPrice}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, '');
                if (!digits) {
                  setNewProductPrice('');
                } else {
                  setNewProductPrice(new Intl.NumberFormat('id-ID').format(parseInt(digits)));
                }
              }}
              className="w-full bg-slate-50 border border-slate-150 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="text-[9px] font-bold text-slate-400 tracking-wider uppercase block mb-1.5">Initial Stock</label>
            <input
              type="number"
              placeholder="20"
              value={newProductQty}
              onChange={(e) => setNewProductQty(e.target.value)}
              className="w-full bg-slate-50 border border-slate-150 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* CATEGORY */}
        <div>
          <label className="text-[9px] font-bold text-slate-400 tracking-wider uppercase block mb-1.5">Category</label>
          <select
            value={newProductCategory}
            onChange={(e) => setNewProductCategory(e.target.value)}
            className="w-full bg-slate-50 border border-slate-150 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          >
            {categories.length > 0 ? (
              categories.map((cat) => (
                <option key={cat.id} value={cat.name}>{cat.emoji} {cat.name}</option>
              ))
            ) : (
              <option value="Umum">📦 Umum</option>
            )}
          </select>
        </div>

        {/* DESCRIPTION */}
        <div>
          <label className="text-[9px] font-bold text-slate-400 tracking-wider uppercase block mb-1.5">Description</label>
          <textarea
            rows={2}
            placeholder="Flavor notes, custom organic syrups, extracts, etc."
            value={newProductDesc}
            onChange={(e) => setNewProductDesc(e.target.value)}
            className="w-full bg-slate-50 border border-slate-150 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
          />
        </div>

        {/* ERROR MESSAGE */}
        {submitError && (
          <div className="flex items-start gap-2 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
            <AlertCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
            <p className="text-xs font-semibold text-rose-700 leading-snug">{submitError}</p>
          </div>
        )}

        {/* SUBMIT BUTTON */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl mt-2 cursor-pointer shadow-lg shadow-indigo-200/50 transition-all hover:shadow-xl active:scale-[0.99] flex items-center justify-center gap-2"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {isSubmitting ? 'Menyimpan...' : 'Create Product'}
        </button>
      </form>
    </Modal>
  );
}

// Default placeholder images per category
function getCategoryDefaultImage(category: string): string {
  switch (category) {
    case 'Coffee': return 'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=300';
    case 'Non-Coffee': return 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?q=80&w=300';
    case 'Food': return 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=300';
    case 'Pastries': return 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=300';
    default: return 'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=300';
  }
}
