import { supabase } from './client';
import { fromCache, toCache, bustCache } from './cache';
import type { Product } from './types';

export const productService = {

  async getProducts(storeId: number): Promise<Product[]> {
    const cacheKey = `products_${storeId}`;
    const cached = fromCache<Product[]>(cacheKey);
    if (cached) return cached;

    if (supabase) {
      const { data, error } = await supabase
        .from('products').select('*').eq('store_id', storeId);
      if (error) {
        console.error('Supabase getProducts error, falling back to LocalStorage', error);
      } else if (data) {
        const result = data.map(d => ({ ...d, store_id: Number(d.store_id) })) as Product[];
        toCache(cacheKey, result);
        return result;
      }
    }

    const products: Product[] = JSON.parse(localStorage.getItem('kasirnya_products') || '[]');
    const result = products.filter(p => p.store_id === storeId);
    toCache(cacheKey, result);
    return result;
  },

  async addProduct(product: Omit<Product, 'id' | 'store_id'>, storeId: number): Promise<Product> {
    if (supabase) {
      const { data, error } = await supabase
        .from('products').insert([{ ...product, store_id: storeId }]).select().single();
      if (error) throw new Error(error.message);
      bustCache(`products_${storeId}`);
      return { ...data, store_id: Number(data.store_id) } as Product;
    }

    const newProduct: Product = {
      ...product,
      id: 'p-' + Math.random().toString(36).substr(2, 9),
      store_id: storeId,
      created_at: new Date().toISOString()
    };
    const products: Product[] = JSON.parse(localStorage.getItem('kasirnya_products') || '[]');
    products.push(newProduct);
    localStorage.setItem('kasirnya_products', JSON.stringify(products));
    bustCache(`products_${storeId}`);
    return newProduct;
  },

  async updateProduct(productId: string, updates: Partial<Omit<Product, 'id' | 'store_id'>>, storeId: number): Promise<Product> {
    if (supabase) {
      const { data, error } = await supabase
        .from('products').update(updates)
        .eq('id', productId).eq('store_id', storeId).select().single();
      if (error) throw new Error(error.message);
      bustCache(`products_${storeId}`);
      return { ...data, store_id: Number(data.store_id) } as Product;
    }

    const products: Product[] = JSON.parse(localStorage.getItem('kasirnya_products') || '[]');
    const index = products.findIndex(p => p.id === productId && p.store_id === storeId);
    if (index === -1) throw new Error('Product not found');
    const updated = { ...products[index], ...updates };
    products[index] = updated;
    localStorage.setItem('kasirnya_products', JSON.stringify(products));
    bustCache(`products_${storeId}`);
    return updated;
  },

  async updateProductStock(productId: string, quantity: number, storeId: number): Promise<boolean> {
    const stockStatus = quantity === 0 ? 'Out of Stock' : quantity <= 5 ? 'Low Stock' : 'In Stock';

    if (supabase) {
      const { error } = await supabase
        .from('products')
        .update({ stock_quantity: quantity, stock_status: stockStatus })
        .eq('id', productId).eq('store_id', storeId);
      if (error) throw new Error(error.message);
      bustCache(`products_${storeId}`);
      return true;
    }

    const products: Product[] = JSON.parse(localStorage.getItem('kasirnya_products') || '[]');
    const index = products.findIndex(p => p.id === productId && p.store_id === storeId);
    if (index !== -1) {
      products[index].stock_quantity = quantity;
      products[index].stock_status = stockStatus;
      localStorage.setItem('kasirnya_products', JSON.stringify(products));
    }
    bustCache(`products_${storeId}`);
    return true;
  },

  async deleteProduct(productId: string, storeId: number): Promise<boolean> {
    if (supabase) {
      const { error } = await supabase
        .from('products').delete().eq('id', productId).eq('store_id', storeId);
      if (error) throw new Error(error.message);
      bustCache(`products_${storeId}`);
      return true;
    }

    const products: Product[] = JSON.parse(localStorage.getItem('kasirnya_products') || '[]');
    localStorage.setItem('kasirnya_products', JSON.stringify(
      products.filter(p => !(p.id === productId && p.store_id === storeId))
    ));
    bustCache(`products_${storeId}`);
    return true;
  }
};
