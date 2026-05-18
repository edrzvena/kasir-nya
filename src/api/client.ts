import { createClient } from '@supabase/supabase-js';
import type { Store, Category, Product, Customer, Transaction } from './types';

export const activeStoreId = import.meta.env.VITE_STORE_ID || 'cafeboy';

const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = !!(
  envUrl &&
  envKey &&
  !envUrl.includes('your-project-id') &&
  !envKey.includes('your-supabase-anon-key')
);

export const supabase = isSupabaseConfigured
  ? createClient(envUrl, envKey)
  : null;

// ── Mock seed data for localStorage demo mode ──────────────────────────────

const defaultStores: Store[] = [
  { id: 1, name: 'Cafe Boy Gourmet', code: 'cafeboy' },
  { id: 2, name: 'Cafe Girl Velvet', code: 'cafegirl' }
];

const defaultCategories: Category[] = [
  { id: 'cat-1', name: 'Coffee',     emoji: '☕', store_id: 1 },
  { id: 'cat-2', name: 'Non-Coffee', emoji: '🍵', store_id: 1 },
  { id: 'cat-3', name: 'Food',       emoji: '🥗', store_id: 1 },
  { id: 'cat-4', name: 'Pastries',   emoji: '🥐', store_id: 1 },
  { id: 'cat-5', name: 'Coffee',     emoji: '☕', store_id: 2 },
  { id: 'cat-6', name: 'Non-Coffee', emoji: '🍵', store_id: 2 },
  { id: 'cat-7', name: 'Food',       emoji: '🥗', store_id: 2 },
  { id: 'cat-8', name: 'Pastries',   emoji: '🥐', store_id: 2 },
];

const defaultProducts: Product[] = [
  {
    id: 'b1-p1', name: 'Caramel Macchiato',
    description: 'Rich espresso with creamy milk and vanilla syrup.',
    price: 4.50, image_url: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?q=80&w=300',
    category: 'Coffee', stock_status: 'In Stock', stock_quantity: 45, store_id: 1
  },
  {
    id: 'b1-p2', name: 'Butter Croissant',
    description: 'Classic French pastry with premium butter.',
    price: 3.25, image_url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=300',
    category: 'Pastries', stock_status: 'In Stock', stock_quantity: 18, store_id: 1
  },
  {
    id: 'b1-p3', name: 'Iced Dark Mocha',
    description: 'Double shot espresso with Swiss cocoa.',
    price: 5.75, image_url: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=300',
    category: 'Coffee', stock_status: 'Low Stock', stock_quantity: 4, store_id: 1
  },
  {
    id: 'g1-p1', name: 'Strawberry Matcha',
    description: 'Creamy green tea matcha with fresh sweet strawberry puree.',
    price: 5.25, image_url: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?q=80&w=300',
    category: 'Non-Coffee', stock_status: 'In Stock', stock_quantity: 30, store_id: 2
  },
  {
    id: 'g1-p2', name: 'Rose Velvet Latte',
    description: 'Rich espresso with floral rose syrup and velvety pink froth.',
    price: 4.75, image_url: 'https://images.unsplash.com/photo-1570968915860-54d5c301fc9f?q=80&w=300',
    category: 'Coffee', stock_status: 'In Stock', stock_quantity: 40, store_id: 2
  }
];

const defaultCustomers: Customer[] = [
  {
    id: 'b1-c1', name: 'John Simmons', phone: '+1 (555) 012-3456',
    email: 'john.simmons@email.com', visits: 24, total_spent: 1420.00,
    last_visit: '2026-05-17T20:30:00.000Z', status: 'Loyal Member', store_id: 1
  },
  {
    id: 'b1-c2', name: 'Maria Lopez', phone: '+1 (555) 987-6543',
    email: 'maria.l@provider.net', visits: 12, total_spent: 645.50,
    last_visit: '2026-05-15T18:45:00.000Z', status: 'Regular', store_id: 1
  },
  {
    id: 'g1-c1', name: 'Chloe Dupont', phone: '+1 (555) 789-0123',
    email: 'chloe.d@pinkmail.com', visits: 32, total_spent: 1845.20,
    last_visit: '2026-05-17T21:30:00.000Z', status: 'Loyal Member', store_id: 2
  }
];

const defaultTransactions: Transaction[] = [
  {
    id: 'b1-t1', order_id: '#ORD-8821', customer_name: 'John Simmons',
    customer_email: 'john.simmons@email.com', total_amount: 124.50,
    payment_method: 'Credit Card', status: 'Success',
    created_at: '2026-05-17T14:30:00.000Z',
    items: [
      { name: 'Espresso Roast', price: 12.40, quantity: 2 },
      { name: 'Chemex Glass Brewer', price: 85.00, quantity: 1 }
    ],
    store_id: 1
  },
  {
    id: 'g1-t1', order_id: '#ORD-9911', customer_name: 'Chloe Dupont',
    customer_email: 'chloe.d@pinkmail.com', total_amount: 85.00,
    payment_method: 'QRIS', status: 'Success',
    created_at: '2026-05-17T15:30:00.000Z',
    items: [
      { name: 'Strawberry Matcha', price: 5.25, quantity: 4 },
      { name: 'Peach Garden Salad', price: 7.50, quantity: 6 }
    ],
    store_id: 2
  }
];

// Seed localStorage with mock data on first run (demo mode only)
const initializeLocalStorage = () => {
  if (!localStorage.getItem('kasirnya_initialized_relational')) {
    localStorage.setItem('kasirnya_stores',       JSON.stringify(defaultStores));
    localStorage.setItem('kasirnya_products',     JSON.stringify(defaultProducts));
    localStorage.setItem('kasirnya_customers',    JSON.stringify(defaultCustomers));
    localStorage.setItem('kasirnya_transactions', JSON.stringify(defaultTransactions));
    localStorage.setItem('kasirnya_categories',   JSON.stringify(defaultCategories));
    localStorage.setItem('kasirnya_initialized_relational', 'true');
  }
};

initializeLocalStorage();
