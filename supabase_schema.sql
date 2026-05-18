-- SQL Schema for Kasirnya POS Template
-- This script sets up the tables for products, transactions, and customers
-- with store_id isolation to support multiple tenants (like cafeboy and cafegirl)

-- 1. Enable UUID Extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL,
    image_url TEXT,
    category TEXT NOT NULL, -- 'Coffee', 'Non-Coffee', 'Food', 'Pastries'
    stock_status TEXT NOT NULL DEFAULT 'In Stock', -- 'In Stock', 'Low Stock', 'Out of Stock'
    stock_quantity INTEGER NOT NULL DEFAULT 50,
    store_id TEXT NOT NULL -- Isolation ID (e.g. 'cafeboy', 'cafegirl')
);

-- 3. Create Customers Table
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    visits INTEGER NOT NULL DEFAULT 0,
    total_spent NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    last_visit TIMESTAMP WITH TIME ZONE,
    status TEXT NOT NULL DEFAULT 'Regular', -- 'Loyal Member', 'Regular', 'New', 'At Risk'
    store_id TEXT NOT NULL -- Isolation ID (e.g. 'cafeboy', 'cafegirl')
);

-- 4. Create Transactions Table
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    order_id TEXT NOT NULL, -- e.g. '#ORD-8821'
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL DEFAULT 'Walk-in Customer',
    customer_email TEXT,
    total_amount NUMERIC(10, 2) NOT NULL,
    payment_method TEXT NOT NULL, -- 'Cash', 'QRIS', 'Debit', 'Credit'
    status TEXT NOT NULL DEFAULT 'Success', -- 'Success', 'Pending', 'Refunded'
    items JSONB NOT NULL, -- Stores cart items (id, name, price, quantity, etc.)
    store_id TEXT NOT NULL -- Isolation ID (e.g. 'cafeboy', 'cafegirl')
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies allowing all public access for the template ease of use
-- In production, these should be hardened to map authenticated users to their stores.
CREATE POLICY "Allow public access to products" ON public.products FOR ALL USING (true);
CREATE POLICY "Allow public access to customers" ON public.customers FOR ALL USING (true);
CREATE POLICY "Allow public access to transactions" ON public.transactions FOR ALL USING (true);

-- 5. Insert Mock Data for 'cafeboy'
INSERT INTO public.products (name, description, price, image_url, category, stock_status, stock_quantity, store_id) VALUES
('Caramel Macchiato', 'Rich espresso with creamy milk and vanilla syrup.', 4.50, 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?q=80&w=300&auto=format&fit=crop', 'Coffee', 'In Stock', 45, 'cafeboy'),
('Butter Croissant', 'Classic French pastry with premium butter.', 3.25, 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=300&auto=format&fit=crop', 'Pastries', 'In Stock', 18, 'cafeboy'),
('Iced Dark Mocha', 'Double shot espresso with Swiss cocoa.', 5.75, 'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=300&auto=format&fit=crop', 'Coffee', 'Low Stock', 4, 'cafeboy'),
('Vanilla Cupcake', 'Soft sponge with Madagascar vanilla bean frosting.', 2.50, 'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?q=80&w=300&auto=format&fit=crop', 'Pastries', 'In Stock', 25, 'cafeboy'),
('Classic Americano', 'Bold and clean espresso with hot water.', 3.50, 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=300&auto=format&fit=crop', 'Coffee', 'In Stock', 50, 'cafeboy');

-- Insert Customers for 'cafeboy'
INSERT INTO public.customers (name, phone, email, visits, total_spent, last_visit, status, store_id) VALUES
('John Simmons', '+1 (555) 012-3456', 'john.simmons@email.com', 24, 1420.00, NOW() - INTERVAL '2 hours', 'Loyal Member', 'cafeboy'),
('Maria Lopez', '+1 (555) 987-6543', 'maria.l@provider.net', 12, 645.50, NOW() - INTERVAL '2 days', 'Regular', 'cafeboy'),
('Robert Brown', '+1 (555) 234-5678', 'rbrown@office.com', 1, 32.00, NOW() - INTERVAL '2 hours', 'New', 'cafeboy'),
('Alice Walker', '+1 (555) 444-5555', 'alice_w@home.net', 56, 3890.15, NOW() - INTERVAL '5 days', 'At Risk', 'cafeboy');

-- Insert Transactions for 'cafeboy'
INSERT INTO public.transactions (order_id, customer_name, customer_email, total_amount, payment_method, status, items, store_id) VALUES
('#ORD-8821', 'John Simmons', 'john.simmons@email.com', 124.50, 'Credit Card', 'Success', '[{"name": "Espresso Roast", "price": 12.40, "quantity": 2}, {"name": "Chemex Glass Brewer", "price": 85.00, "quantity": 1}, {"name": "Paper Filters", "price": 15.10, "quantity": 1}]'::jsonb, 'cafeboy'),
('#ORD-8820', 'Mark Smith', 'mark.smith@email.com', 45.00, 'Cash', 'Pending', '[{"name": "Butter Croissant", "price": 3.25, "quantity": 3}, {"name": "Iced Dark Mocha", "price": 5.75, "quantity": 6}]'::jsonb, 'cafeboy'),
('#ORD-8819', 'Walk-in Customer', NULL, 312.20, 'E-Wallet', 'Refunded', '[{"name": "Caramel Macchiato", "price": 4.50, "quantity": 10}, {"name": "Vanilla Cupcake", "price": 2.50, "quantity": 20}, {"name": "Classic Americano", "price": 3.50, "quantity": 62}]'::jsonb, 'cafeboy'),
('#ORD-8818', 'Robert Lee', 'robert.lee@email.com', 56.00, 'Debit Card', 'Success', '[{"name": "Iced Dark Mocha", "price": 5.75, "quantity": 8}, {"name": "Butter Croissant", "price": 3.25, "quantity": 3}]'::jsonb, 'cafeboy');


-- 6. Insert Mock Data for 'cafegirl'
INSERT INTO public.products (name, description, price, image_url, category, stock_status, stock_quantity, store_id) VALUES
('Strawberry Matcha', 'Creamy green tea matcha with fresh sweet strawberry puree.', 5.25, 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?q=80&w=300&auto=format&fit=crop', 'Non-Coffee', 'In Stock', 30, 'cafegirl'),
('Rose Velvet Latte', 'Rich espresso with floral rose syrup and velvety pink froth.', 4.75, 'https://images.unsplash.com/photo-1570968915860-54d5c301fc9f?q=80&w=300&auto=format&fit=crop', 'Coffee', 'In Stock', 40, 'cafegirl'),
('Peach Garden Salad', 'Crisp fresh summer greens with caramelized peach slices.', 7.50, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=300&auto=format&fit=crop', 'Food', 'In Stock', 15, 'cafegirl'),
('Almond Pain au Chocolat', 'Buttery layered pastry filled with dark chocolate and topped with almonds.', 3.75, 'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?q=80&w=300&auto=format&fit=crop', 'Pastries', 'Low Stock', 3, 'cafegirl'),
('Iced Lavender Tea', 'Refreshing chamomile tea infused with French lavender petals.', 3.50, 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?q=80&w=300&auto=format&fit=crop', 'Non-Coffee', 'In Stock', 25, 'cafegirl');

-- Insert Customers for 'cafegirl'
INSERT INTO public.customers (name, phone, email, visits, total_spent, last_visit, status, store_id) VALUES
('Chloe Dupont', '+1 (555) 789-0123', 'chloe.d@pinkmail.com', 32, 1845.20, NOW() - INTERVAL '1 hour', 'Loyal Member', 'cafegirl'),
('Emma Watson', '+1 (555) 345-6789', 'emma.watson@gmail.com', 8, 320.40, NOW() - INTERVAL '3 days', 'Regular', 'cafegirl'),
('Lucas Miller', '+1 (555) 901-2345', 'lucas.m@designstudio.com', 2, 45.00, NOW() - INTERVAL '4 hours', 'New', 'cafegirl'),
('Sophia Loren', '+1 (555) 567-8901', 'sophia@vintage.org', 42, 2980.50, NOW() - INTERVAL '8 days', 'At Risk', 'cafegirl');

-- Insert Transactions for 'cafegirl'
INSERT INTO public.transactions (order_id, customer_name, customer_email, total_amount, payment_method, status, items, store_id) VALUES
('#ORD-9911', 'Chloe Dupont', 'chloe.d@pinkmail.com', 85.00, 'QRIS', 'Success', '[{"name": "Strawberry Matcha", "price": 5.25, "quantity": 4}, {"name": "Peach Garden Salad", "price": 7.50, "quantity": 6}, {"name": "Almond Pain au Chocolat", "price": 3.75, "quantity": 5}]'::jsonb, 'cafegirl'),
('#ORD-9910', 'Emma Watson', 'emma.watson@gmail.com', 28.50, 'Debit Card', 'Success', '[{"name": "Rose Velvet Latte", "price": 4.75, "quantity": 4}, {"name": "Almond Pain au Chocolat", "price": 3.75, "quantity": 2}]'::jsonb, 'cafegirl'),
('#ORD-9909', 'Walk-in Customer', NULL, 12.25, 'Cash', 'Success', '[{"name": "Iced Lavender Tea", "price": 3.50, "quantity": 2}, {"name": "Almond Pain au Chocolat", "price": 3.75, "quantity": 1}]'::jsonb, 'cafegirl');
