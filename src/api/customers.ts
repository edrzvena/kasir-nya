import { supabase } from './client';
import { fromCache, toCache, bustCache } from './cache';
import type { Customer } from './types';

export const customerService = {

  async getCustomers(storeId: number): Promise<Customer[]> {
    const cacheKey = `customers_${storeId}`;
    const cached = fromCache<Customer[]>(cacheKey);
    if (cached) return cached;

    if (supabase) {
      const { data, error } = await supabase
        .from('customers').select('*').eq('store_id', storeId);
      if (error) {
        console.error('Supabase getCustomers error, falling back to LocalStorage', error);
      } else if (data) {
        const result = data.map(d => ({ ...d, store_id: Number(d.store_id) })) as Customer[];
        toCache(cacheKey, result);
        return result;
      }
    }

    const customers: Customer[] = JSON.parse(localStorage.getItem('kasirnya_customers') || '[]');
    const result = customers.filter(c => c.store_id === storeId);
    toCache(cacheKey, result);
    return result;
  },

  async addCustomer(
    customer: Omit<Customer, 'id' | 'visits' | 'total_spent' | 'status' | 'store_id' | 'last_visit'>,
    storeId: number
  ): Promise<Customer> {
    const newCustomer: Customer = {
      ...customer,
      id: 'c-' + Math.random().toString(36).substr(2, 9),
      visits: 0,
      total_spent: 0,
      status: 'New',
      store_id: storeId,
      created_at: new Date().toISOString(),
      last_visit: new Date().toISOString()
    };

    if (supabase) {
      const { data, error } = await supabase
        .from('customers')
        .insert([{ ...customer, visits: 0, total_spent: 0, status: 'New', store_id: storeId }])
        .select().single();
      if (error) {
        console.error('Supabase addCustomer error, falling back to LocalStorage', error);
      } else if (data) {
        bustCache(`customers_${storeId}`);
        return { ...data, store_id: Number(data.store_id) } as Customer;
      }
    }

    const customers: Customer[] = JSON.parse(localStorage.getItem('kasirnya_customers') || '[]');
    customers.push(newCustomer);
    localStorage.setItem('kasirnya_customers', JSON.stringify(customers));
    bustCache(`customers_${storeId}`);
    return newCustomer;
  },

  async syncCustomerStatsAfterSale(customerName: string, amount: number, storeId: number): Promise<void> {
    if (customerName === 'Walk-in Customer') return;

    if (supabase) {
      const { data: customer } = await supabase
        .from('customers').select('*')
        .eq('name', customerName).eq('store_id', storeId).single();

      if (customer) {
        const newVisits = customer.visits + 1;
        const newTotalSpent = Number(customer.total_spent) + amount;
        let status = 'Regular';
        if (newVisits >= 20 || newTotalSpent >= 1000) {
          status = 'Loyal Member';
        } else if (newVisits >= 5) {
          status = 'Regular';
        } else {
          status = 'New';
        }

        await supabase
          .from('customers')
          .update({ visits: newVisits, total_spent: newTotalSpent, status, last_visit: new Date().toISOString() })
          .eq('id', customer.id);
        return;
      }
    }

    const customers: Customer[] = JSON.parse(localStorage.getItem('kasirnya_customers') || '[]');
    const index = customers.findIndex(c => c.name === customerName && c.store_id === storeId);
    if (index !== -1) {
      customers[index].visits += 1;
      customers[index].total_spent += amount;
      customers[index].last_visit = new Date().toISOString();

      const visits = customers[index].visits;
      const spent = customers[index].total_spent;
      if (visits >= 20 || spent >= 1000) {
        customers[index].status = 'Loyal Member';
      } else if (visits >= 5) {
        customers[index].status = 'Regular';
      } else {
        customers[index].status = 'New';
      }

      localStorage.setItem('kasirnya_customers', JSON.stringify(customers));
    }
  }
};
