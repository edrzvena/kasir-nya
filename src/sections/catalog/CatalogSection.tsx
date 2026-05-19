import { useState, useEffect, useMemo } from 'react';
import { Package, Plus, LayoutGrid, List, Search, TrendingUp, AlertTriangle, XCircle, ShoppingBag } from 'lucide-react';
import { dbService } from '../../lib/db';
import type { Product, Category } from '../../lib/db';

// Import modular sections
import CatalogGrid from './CatalogGrid';
import CatalogTable from './CatalogTable';
import EditProductModal from '../../components/modal/EditProductModal';
import AddProductModal from '../../components/modal/AddProductModal';
import CategoryManager from './CategoryManager';

interface CatalogSectionProps {
  storeId: number;
  refreshTrigger: number;
  triggerRefresh: () => void;
}

export default function CatalogSection({ storeId, refreshTrigger, triggerRefresh }: CatalogSectionProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modals active states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Fetch menu products and categories from isolated client base
  useEffect(() => {
    const fetchData = async () => {
      const [prodData, catData] = await Promise.all([
        dbService.getProducts(storeId),
        dbService.getCategories(storeId)
      ]);
      setProducts(prodData);
      setCategories(catData);
    };
    fetchData();
  }, [storeId, refreshTrigger]);

  // Compute stats from product data
  const stats = useMemo(() => {
    const totalProducts = products.length;
    const inStock = products.filter(p => p.stock_status === 'In Stock').length;
    const lowStock = products.filter(p => p.stock_status === 'Low Stock').length;
    const outOfStock = products.filter(p => p.stock_quantity === 0).length;
    return { totalProducts, inStock, lowStock, outOfStock };
  }, [products]);

  // Dynamic categories from database
  const categoryNames = ['All', ...categories.map(c => c.name)];

  // Filter products based on search and category tab
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, activeCategory]);

  const handleStockChange = (productId: string, newStock: number) => {
    if (newStock < 0) return;
    const stockStatus = newStock === 0 ? 'Out of Stock' : newStock <= 5 ? 'Low Stock' : 'In Stock';
    // Optimistic — langsung update UI, tulis ke DB di background
    setProducts(prev => prev.map(p =>
      p.id === productId ? { ...p, stock_quantity: newStock, stock_status: stockStatus } : p
    ));
    dbService.updateProductStock(productId, newStock, storeId);
  };

  const handleEditClick = (product: Product) => {
    setSelectedProduct(product);
    setIsEditOpen(true);
  };

  const handleDeleteClick = (productId: string) => {
    if (confirm("Yakin ingin menghapus produk ini dari katalog? Tindakan ini tidak dapat dibatalkan.")) {
      // Optimistic — langsung hilang dari UI, hapus di DB di background
      setProducts(prev => prev.filter(p => p.id !== productId));
      dbService.deleteProduct(productId, storeId);
    }
  };

  const statCards = [
    { label: 'Total Products', value: stats.totalProducts, icon: ShoppingBag, color: 'from-indigo-500 to-violet-600', bgLight: 'bg-indigo-50', textColor: 'text-indigo-600' },
    { label: 'In Stock', value: stats.inStock, icon: TrendingUp, color: 'from-emerald-500 to-teal-600', bgLight: 'bg-emerald-50', textColor: 'text-emerald-600' },
    { label: 'Low Stock', value: stats.lowStock, icon: AlertTriangle, color: 'from-amber-500 to-orange-600', bgLight: 'bg-amber-50', textColor: 'text-amber-600' },
    { label: 'Out of Stock', value: stats.outOfStock, icon: XCircle, color: 'from-rose-500 to-pink-600', bgLight: 'bg-rose-50', textColor: 'text-rose-600' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn pb-12">

      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-extrabold text-slate-800 text-xl leading-none flex items-center gap-2.5">
            <div className="h-9 w-9 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200/50">
              <Package className="h-4.5 w-4.5 text-white" />
            </div>
            <span>Product Catalog</span>
          </h2>
          <p className="text-slate-400 text-xs mt-2 font-medium ml-11.5">
            Kelola produk dan kategori — tambah, edit, atau hapus item.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-extrabold text-xs px-5 py-3 rounded-xl cursor-pointer shadow-lg shadow-indigo-200/50 flex items-center gap-2 self-start transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-indigo-200/60 active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          <span>Add Product</span>
        </button>
      </div>

      {/* TOP ROW: STATS + CATEGORY MANAGER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Stats Cards */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-3">
          {statCards.map((stat) => (
            <div
              key={stat.label}
              className="bg-white border border-slate-100/80 rounded-2xl p-4 flex items-center gap-3.5 shadow-sm hover:shadow-md transition-shadow group"
            >
              <div className={`h-10 w-10 ${stat.bgLight} rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                <stat.icon className={`h-5 w-5 ${stat.textColor}`} />
              </div>
              <div className="min-w-0">
                <span className="text-xl font-extrabold text-slate-800 block leading-none">{stat.value}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5 block">{stat.label}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Category Manager */}
        <CategoryManager
          categories={categories}
          storeId={storeId}
          onRefresh={triggerRefresh}
        />
      </div>

      {/* FILTER, SEARCH & VIEW TOGGLE */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        {/* Search */}
        <div className="relative md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-100 rounded-2xl pl-11 pr-6 py-3 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm transition-all"
          />
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Category Tabs - scrollable for many categories */}
          <div className="flex gap-1.5 bg-slate-50 border border-slate-100 p-1 rounded-2xl overflow-x-auto self-start shadow-inner max-w-[500px] scrollbar-hide">
            {categoryNames.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${activeCategory === cat
                    ? 'bg-white text-indigo-700 shadow-sm shadow-indigo-50/50'
                    : 'text-slate-500 hover:text-slate-700'
                  }`}
              >
                {cat !== 'All' && categories.find(c => c.name === cat)?.emoji + ' '}
                {cat}
              </button>
            ))}
          </div>

          {/* View Toggle */}
          <div className="flex bg-slate-50 border border-slate-100 p-1 rounded-xl shadow-inner">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all cursor-pointer ${viewMode === 'grid'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600'
                }`}
              title="Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg transition-all cursor-pointer ${viewMode === 'table'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600'
                }`}
              title="Table View"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* PRODUCT COUNT LABEL */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-slate-400">
          Showing <span className="text-slate-700">{filteredProducts.length}</span> of <span className="text-slate-700">{products.length}</span> products
        </p>
      </div>

      {/* CATALOG VIEW (GRID or TABLE) */}
      {viewMode === 'grid' ? (
        <CatalogGrid
          products={filteredProducts}
          onStockChange={handleStockChange}
          onEditClick={handleEditClick}
          onDeleteClick={handleDeleteClick}
          categories={categories}
        />
      ) : (
        <CatalogTable
          products={filteredProducts}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          onStockChange={handleStockChange}
          onEditClick={handleEditClick}
          onDeleteClick={handleDeleteClick}
          categories={categories}
        />
      )}

      {/* MODAL: ADD A NEW PRODUCT — mount fresh so useState initializes with loaded categories */}
      {isAddOpen && (
        <AddProductModal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          onSuccess={(newProduct) => {
            setProducts(prev => [newProduct, ...prev]);
            setIsAddOpen(false);
          }}
          storeId={storeId}
          categories={categories}
        />
      )}

      {isEditOpen && selectedProduct && (
        <EditProductModal
          isOpen={isEditOpen}
          onClose={() => {
            setIsEditOpen(false);
            setSelectedProduct(null);
          }}
          onSuccess={(updated) => {
            setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
            setIsEditOpen(false);
            setSelectedProduct(null);
          }}
          product={selectedProduct}
          storeId={storeId}
          categories={categories}
        />
      )}

    </div>
  );
}
