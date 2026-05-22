export interface Product {
  id: string;
  created_at?: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  stock_status: string;
  stock_quantity: number;
  store_id: number;
}

export interface Transaction {
  id: string;
  created_at?: string;
  order_id: string;
  customer_name: string;
  customer_email?: string;
  cashier_name?: string;
  total_amount: number;
  payment_method: string;
  status: string;
  items: Array<{
    name: string;
    price: number;
    quantity: number;
    category?: string;
    note?: string;
  }>;
  store_id: number;
}

export interface Cashier {
  id: string;
  name: string;
  email: string;
  password: string;
  store_id: number;
  created_at?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  role: 'admin' | 'cashier';
  store_id: number;
  name?: string;
}

export interface Store {
  id: number;
  name: string;
  code: string;
  avatar_url?: string;
}

export interface Category {
  id: string;
  name: string;
  emoji: string;
  store_id: number;
  created_at?: string;
}
