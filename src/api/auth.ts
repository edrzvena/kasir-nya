import { supabase } from './client';
import { fromCache, toCache } from './cache';
import type { UserProfile, Store, Cashier } from './types';

export const authService = {

  async getOrCreateStore(storeCode: string): Promise<number> {
    const formattedCode = storeCode.trim().toLowerCase().replace(/\s+/g, '-');

    if (supabase) {
      const { data: existingStore } = await supabase
        .from('stores').select('id').eq('code', formattedCode).maybeSingle();
      if (existingStore) return Number(existingStore.id);

      const capitalizedName = formattedCode
        .split('-').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');

      const { data: newStore, error: insertError } = await supabase
        .from('stores')
        .insert([{ name: capitalizedName + ' Suite', code: formattedCode }])
        .select('id').single();

      if (insertError || !newStore) throw new Error(insertError?.message || 'Gagal inisialisasi data toko.');
      return Number(newStore.id);
    }

    const stores: Store[] = JSON.parse(localStorage.getItem('kasirnya_stores') || '[]');
    const matched = stores.find(s => s.code === formattedCode);
    if (matched) return Number(matched.id);

    const newId = stores.length + 1;
    const capitalizedName = formattedCode
      .split('-').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
    const freshStore = { id: newId, name: capitalizedName + ' Suite', code: formattedCode };
    stores.push(freshStore);
    localStorage.setItem('kasirnya_stores', JSON.stringify(stores));
    return newId;
  },

  async getStoreById(storeId: number): Promise<Store | null> {
    if (supabase) {
      const { data, error } = await supabase
        .from('stores').select('*').eq('id', storeId).single();
      if (!error && data) return data as Store;
      return null;
    }

    const stores: Store[] = JSON.parse(localStorage.getItem('kasirnya_stores') || '[]');
    const store = stores.find(s => s.id === storeId) || null;
    if (store) {
      const cached = localStorage.getItem(`kasirnya_avatar_${storeId}`);
      if (cached) store.avatar_url = cached;
    }
    return store;
  },

  async updateStoreAvatar(storeId: number, avatarBase64: string): Promise<void> {
    localStorage.setItem(`kasirnya_avatar_${storeId}`, avatarBase64);
    if (supabase) {
      const { error } = await supabase
        .from('stores').update({ avatar_url: avatarBase64 }).eq('id', storeId);
      if (error) throw new Error('Gagal menyimpan foto ke cloud: ' + error.message);
    }
  },

  async signIn(email: string, password: string): Promise<UserProfile> {
    const cleanEmail = email.trim().toLowerCase();

    if (supabase) {
      const adminAttempt = await supabase.auth.signInWithPassword({ email: cleanEmail, password });

      if (!adminAttempt.error && adminAttempt.data.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles').select('*').eq('id', adminAttempt.data.user.id).single();
        if (profileError || !profile) {
          throw new Error('Profil pengguna belum dikonfigurasi.');
        }
        return {
          id: profile.id, email: profile.email,
          role: profile.role, store_id: Number(profile.store_id)
        };
      }

      const { data: cashier } = await supabase
        .from('cashiers').select('*')
        .ilike('email', cleanEmail).eq('password', password).maybeSingle();

      if (cashier) {
        const sessionUser: UserProfile = {
          id: cashier.id, email: cashier.email,
          role: 'cashier', store_id: Number(cashier.store_id), name: cashier.name
        };
        localStorage.setItem('kasirnya_current_user', JSON.stringify(sessionUser));
        return sessionUser;
      }

      throw new Error('Email atau kata sandi salah.');
    }

    const profiles: UserProfile[] = JSON.parse(localStorage.getItem('kasirnya_profiles') || '[]');
    const matchedAdmin = profiles.find(p => p.email === cleanEmail);
    if (matchedAdmin) {
      localStorage.setItem('kasirnya_current_user', JSON.stringify(matchedAdmin));
      return matchedAdmin;
    }

    const cashiers: Cashier[] = JSON.parse(localStorage.getItem('kasirnya_cashiers') || '[]');
    const matchedCashier = cashiers.find(c => c.email?.toLowerCase() === cleanEmail && c.password === password);
    if (matchedCashier) {
      const sessionUser: UserProfile = {
        id: matchedCashier.id, email: matchedCashier.email,
        role: 'cashier', store_id: matchedCashier.store_id, name: matchedCashier.name
      };
      localStorage.setItem('kasirnya_current_user', JSON.stringify(sessionUser));
      return sessionUser;
    }

    throw new Error('Email atau kata sandi salah.');
  },

  async getCurrentSession(): Promise<UserProfile | null> {
    if (supabase) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles').select('*').eq('id', session.user.id).single();
        if (profile) {
          return {
            id: profile.id, email: profile.email,
            role: profile.role, store_id: Number(profile.store_id)
          };
        }
      }
    }

    const raw = localStorage.getItem('kasirnya_current_user');
    return raw ? JSON.parse(raw) : null;
  },

  async signOut(): Promise<void> {
    if (supabase) await supabase.auth.signOut();
    localStorage.removeItem('kasirnya_current_user');
  },

  async getCashiers(storeId: number): Promise<Cashier[]> {
    const cacheKey = `cashiers_${storeId}`;
    const cached = fromCache<Cashier[]>(cacheKey);
    if (cached) return cached;

    if (supabase) {
      const { data, error } = await supabase
        .from('cashiers').select('*').eq('store_id', storeId);
      if (!error && data) {
        const result = data.map(d => ({ ...d, store_id: Number(d.store_id) })) as Cashier[];
        toCache(cacheKey, result);
        return result;
      }
      return [];
    }

    const cashiers: Cashier[] = JSON.parse(localStorage.getItem('kasirnya_cashiers') || '[]');
    const result = cashiers.filter(c => c.store_id === storeId);
    toCache(cacheKey, result);
    return result;
  },

  async resetPassword(email: string): Promise<void> {
    if (supabase) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin
      });
      if (error) throw error;
    } else {
      throw new Error('Supabase belum dikonfigurasi. Reset kata sandi butuh database cloud.');
    }
  },

  async updatePassword(password: string): Promise<void> {
    if (supabase) {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
    } else {
      throw new Error('Supabase belum dikonfigurasi.');
    }
  }
};
