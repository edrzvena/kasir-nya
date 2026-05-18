import { supabase } from './client';
import { fromCache, toCache, bustCache } from './cache';
import type { Category } from './types';

export const categoryService = {

  async getCategories(storeId: number): Promise<Category[]> {
    const cacheKey = `categories_${storeId}`;
    const cached = fromCache<Category[]>(cacheKey);
    if (cached) return cached;

    if (supabase) {
      const { data, error } = await supabase
        .from('categories').select('*').eq('store_id', storeId)
        .order('name', { ascending: true });
      if (!error && data) {
        toCache(cacheKey, data as Category[]);
        return data as Category[];
      }
    }

    const categories: Category[] = JSON.parse(localStorage.getItem('kasirnya_categories') || '[]');
    const result = categories.filter(c => c.store_id === storeId).sort((a, b) => a.name.localeCompare(b.name));
    toCache(cacheKey, result);
    return result;
  },

  async addCategory(category: { name: string; emoji: string }, storeId: number): Promise<Category> {
    if (supabase) {
      const { data, error } = await supabase
        .from('categories').insert([{ ...category, store_id: storeId }]).select().single();
      if (error) throw new Error(error.message);
      bustCache(`categories_${storeId}`);
      return { ...data, store_id: Number(data.store_id) } as Category;
    }

    const newCat: Category = {
      id: 'cat-' + Date.now(),
      name: category.name,
      emoji: category.emoji,
      store_id: storeId,
      created_at: new Date().toISOString()
    };
    const categories: Category[] = JSON.parse(localStorage.getItem('kasirnya_categories') || '[]');
    categories.push(newCat);
    localStorage.setItem('kasirnya_categories', JSON.stringify(categories));
    bustCache(`categories_${storeId}`);
    return newCat;
  },

  async updateCategory(categoryId: string, updates: { name: string; emoji: string }, storeId: number): Promise<void> {
    if (supabase) {
      const { error } = await supabase
        .from('categories').update(updates).eq('id', categoryId).eq('store_id', storeId);
      if (error) throw new Error(error.message);
      bustCache(`categories_${storeId}`);
      return;
    }

    const categories: Category[] = JSON.parse(localStorage.getItem('kasirnya_categories') || '[]');
    const idx = categories.findIndex(c => c.id === categoryId);
    if (idx !== -1) {
      categories[idx] = { ...categories[idx], ...updates };
      localStorage.setItem('kasirnya_categories', JSON.stringify(categories));
    }
    bustCache(`categories_${storeId}`);
  },

  async deleteCategory(categoryId: string, storeId: number): Promise<void> {
    if (supabase) {
      const { error } = await supabase
        .from('categories').delete().eq('id', categoryId).eq('store_id', storeId);
      if (error) throw new Error(error.message);
      bustCache(`categories_${storeId}`);
      return;
    }

    const categories: Category[] = JSON.parse(localStorage.getItem('kasirnya_categories') || '[]');
    localStorage.setItem('kasirnya_categories', JSON.stringify(
      categories.filter(c => c.id !== categoryId)
    ));
    bustCache(`categories_${storeId}`);
  }
};
