import { supabase } from './client';
import { fromCache, toCache, bustCache } from './cache';
import { customerService } from './customers';
import type { Transaction } from './types';

export const transactionService = {

  async getTransactions(storeId: number): Promise<Transaction[]> {
    const cacheKey = `transactions_${storeId}`;
    const cached = fromCache<Transaction[]>(cacheKey);
    if (cached) return cached;

    if (supabase) {
      const { data, error } = await supabase
        .from('transactions').select('*').eq('store_id', storeId)
        .order('created_at', { ascending: false });
      if (error) {
        console.error('Supabase getTransactions error, falling back to LocalStorage', error);
      } else if (data) {
        const result = data.map(d => ({ ...d, store_id: Number(d.store_id) })) as Transaction[];
        toCache(cacheKey, result);
        return result;
      }
    }

    const transactions: Transaction[] = JSON.parse(localStorage.getItem('kasirnya_transactions') || '[]');
    const result = transactions
      .filter(t => t.store_id === storeId)
      .sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime());
    toCache(cacheKey, result);
    return result;
  },

  async createTransaction(transaction: Omit<Transaction, 'id' | 'created_at'>, storeId: number): Promise<Transaction> {
    const newTransaction: Transaction = {
      ...transaction,
      id: 't-' + Math.random().toString(36).substr(2, 9),
      store_id: storeId,
      created_at: new Date().toISOString()
    };

    if (supabase) {
      const { data, error } = await supabase
        .from('transactions').insert([{ ...transaction, store_id: storeId }]).select().single();
      if (error) {
        console.error('Supabase createTransaction error, falling back to LocalStorage', error);
      } else if (data) {
        bustCache(`transactions_${storeId}`, `customers_${storeId}`);
        await customerService.syncCustomerStatsAfterSale(transaction.customer_name, transaction.total_amount, storeId);
        return { ...data, store_id: Number(data.store_id) } as Transaction;
      }
    }

    const transactions: Transaction[] = JSON.parse(localStorage.getItem('kasirnya_transactions') || '[]');
    transactions.push(newTransaction);
    localStorage.setItem('kasirnya_transactions', JSON.stringify(transactions));
    bustCache(`transactions_${storeId}`, `customers_${storeId}`);
    await customerService.syncCustomerStatsAfterSale(transaction.customer_name, transaction.total_amount, storeId);

    return newTransaction;
  }
};
