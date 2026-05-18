import { useState, useEffect } from 'react';
import { dbService } from '../../lib/db';
import type { Product, Transaction, Category, UserProfile } from '../../lib/db';

import ProductGrid from './ProductGrid';
import CartDrawer from './CartDrawer';
import OrderSuccessModal from '../../components/modal/OrderSuccessModal';

interface POSSectionProps {
  storeId: number;
  refreshTrigger: number;
  triggerRefresh: () => void;
  currentUser: UserProfile;
}

interface CartItem {
  product: Product;
  quantity: number;
}

export default function POSSection({ storeId, refreshTrigger, triggerRefresh, currentUser }: POSSectionProps) {
  // Database States
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // Cart & Sales States
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('QRIS');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  // Modal open states
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(null);

  // Fetch Products and Categories
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

  // Reset Cart when store changes
  useEffect(() => {
    setCart([]);
  }, [storeId]);

  // Cart actions
  const handleAddToCart = (product: Product) => {
    setCart(prev => {
      const exists = prev.find(item => item.product.id === product.id);
      if (exists) {
        if (exists.quantity >= product.stock_quantity) {
          alert(`Cannot add more! Only ${product.stock_quantity} items available in stock.`);
          return prev;
        }
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleUpdateCartQty = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    const product = products.find(p => p.id === productId);
    if (product && quantity > product.stock_quantity) {
      alert(`Cannot add more! Only ${product.stock_quantity} items available in stock.`);
      return;
    }
    setCart(prev => prev.map(item => 
      item.product.id === productId ? { ...item, quantity } : item
    ));
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  // Cart total sum
  const totalAmount = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  // Checkout Handler
  const handleCheckoutSubmit = async () => {
    if (cart.length === 0 || !customerName.trim()) return;

    const invoiceNo = '#ORD-' + Math.floor(1000 + Math.random() * 9000);

    const transactionPayload = {
      order_id: invoiceNo,
      customer_name: customerName.trim(),
      customer_email: '',
      cashier_name: currentUser.name || (currentUser.role === 'admin' ? 'Admin' : currentUser.email),
      total_amount: totalAmount + (totalAmount * 0.1), // 10% PPN tax included
      payment_method: paymentMethod,
      status: 'Success',
      store_id: storeId,
      items: cart.map(item => ({
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        category: item.product.category,
      }))
    };

    // Create checkout transaction
    const newTx = await dbService.createTransaction(transactionPayload, storeId);
    
    // Decrement inventory stocks
    for (const item of cart) {
      const remainingStock = item.product.stock_quantity - item.quantity;
      await dbService.updateProductStock(item.product.id, remainingStock, storeId);
    }

    // Trigger state success
    setLastTransaction(newTx);
    setIsSuccessOpen(true);
    setCart([]);
    setCustomerName('');
    triggerRefresh(); // Sync DB state to all sibling sections!
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 animate-fadeIn">
      
      {/* Product Grid Area (Left Panel) */}
      <div className="flex-1 space-y-6">
        <div className="flex justify-between items-center shrink-0">
          <div>
            <h2 className="font-extrabold text-slate-800 text-xl leading-none">Kasir POS</h2>
            <p className="text-slate-400 text-xs mt-1.5 font-medium">Pilih menu dan buat pesanan customer.</p>
          </div>
        </div>

        <ProductGrid 
          products={products}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onAddToCart={handleAddToCart}
          categories={categories}
        />
      </div>

      {/* Cart Drawer Billing Panel (Right Panel) */}
      <CartDrawer 
        cart={cart}
        onUpdateQty={handleUpdateCartQty}
        onRemove={handleRemoveFromCart}
        selectedCustomerName={customerName}
        setSelectedCustomerName={setCustomerName}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        onCheckout={handleCheckoutSubmit}
        totalAmount={totalAmount}
      />

      {/* MODAL: ORDER SUCCESS POPUP */}
      <OrderSuccessModal 
        isOpen={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
        transaction={lastTransaction}
      />

    </div>
  );
}
