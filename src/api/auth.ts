import { supabase } from './client';
import { fromCache, toCache, bustCache } from './cache';
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

      if (insertError || !newStore) throw new Error(insertError?.message || 'Failed to initialize store credentials.');
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

  async signUpAdmin(email: string, password: string): Promise<UserProfile> {
    if (supabase) {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      if (!data.user) throw new Error('Failed to establish account.');

      // Profile row dibuat otomatis oleh DB trigger on_auth_user_created
      return { id: data.user.id, email, role: 'admin', store_id: 1 };
    }

    const profiles: UserProfile[] = JSON.parse(localStorage.getItem('kasirnya_profiles') || '[]');
    if (profiles.some(p => p.email === email)) throw new Error('Email already registered.');

    const newProfile: UserProfile = {
      id: 'usr-' + Math.random().toString(36).substr(2, 9),
      email, role: 'admin', store_id: 1
    };
    profiles.push(newProfile);
    localStorage.setItem('kasirnya_profiles', JSON.stringify(profiles));
    localStorage.setItem('kasirnya_current_user', JSON.stringify(newProfile));
    return newProfile;
  },

  async signIn(email: string, password: string): Promise<UserProfile> {
    if (supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (!data.user) throw new Error('Login failed.');

      const { data: profile, error: profileError } = await supabase
        .from('profiles').select('*').eq('id', data.user.id).single();
      if (profileError || !profile) {
        throw new Error('User profile role not configured in public.profiles table.');
      }

      return {
        id: profile.id, email: profile.email,
        role: profile.role, store_id: Number(profile.store_id)
      };
    }

    const profiles: UserProfile[] = JSON.parse(localStorage.getItem('kasirnya_profiles') || '[]');
    const matched = profiles.find(p => p.email === email);
    if (!matched) throw new Error('Invalid email or password.');
    localStorage.setItem('kasirnya_current_user', JSON.stringify(matched));
    return matched;
  },

  async createCashier(username: string, name: string, pin: string, storeId: number): Promise<Cashier> {
    const cleanUsername = username.trim().toLowerCase().replace(/\s+/g, '');

    if (supabase) {
      const { data, error } = await supabase
        .from('cashiers')
        .insert([{ username: cleanUsername, name, pin, store_id: storeId }])
        .select().single();

      if (error) {
        if (error.code === '23505') {
          throw new Error('This username is already taken by another store employee. Please choose a unique username.');
        }
        console.error('Supabase createCashier error, falling back to LocalStorage', error);
      } else if (data) {
        bustCache(`cashiers_${storeId}`);
        return { ...data, store_id: Number(data.store_id) } as Cashier;
      }
    }

    const cashiers: Cashier[] = JSON.parse(localStorage.getItem('kasirnya_cashiers') || '[]');
    if (cashiers.some(c => c.username === cleanUsername)) {
      throw new Error('This username is already taken. Please choose a unique username.');
    }
    if (cashiers.some(c => c.store_id === storeId && c.pin === pin)) {
      throw new Error('This PIN is already registered for this store.');
    }

    const newCashier: Cashier = {
      id: 'csh-' + Math.random().toString(36).substr(2, 9),
      username: cleanUsername, name, pin, store_id: storeId,
      created_at: new Date().toISOString()
    };
    cashiers.push(newCashier);
    localStorage.setItem('kasirnya_cashiers', JSON.stringify(cashiers));
    bustCache(`cashiers_${storeId}`);
    return newCashier;
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

  async signInCashier(adminEmail: string, username: string, pin: string): Promise<UserProfile> {
    const cleanUsername = username.trim().toLowerCase();
    const cleanAdminEmail = adminEmail.trim().toLowerCase();

    if (supabase) {
      const { data: adminProfile, error: adminError } = await supabase
        .from('profiles').select('store_id, email')
        .eq('email', cleanAdminEmail).eq('role', 'admin').single();
      if (adminError || !adminProfile) throw new Error('Store Admin email is not registered.');

      const { data: cashier, error: cashierError } = await supabase
        .from('cashiers').select('*')
        .eq('store_id', adminProfile.store_id)
        .ilike('username', cleanUsername).eq('pin', pin).single();
      if (cashierError || !cashier) throw new Error('Invalid Username or PIN code for this outlet.');

      const sessionUser: UserProfile = {
        id: cashier.id, email: adminProfile.email,
        role: 'cashier', store_id: Number(adminProfile.store_id), name: cashier.name
      };
      localStorage.setItem('kasirnya_current_user', JSON.stringify(sessionUser));
      return sessionUser;
    }

    const profiles: UserProfile[] = JSON.parse(localStorage.getItem('kasirnya_profiles') || '[]');
    const adminProfile = profiles.find(p => p.email === cleanAdminEmail && p.role === 'admin');
    if (!adminProfile) throw new Error('Store Admin email is not registered.');

    const cashiers: Cashier[] = JSON.parse(localStorage.getItem('kasirnya_cashiers') || '[]');
    const cashier = cashiers.find(
      c => c.store_id === adminProfile.store_id && c.username === cleanUsername && c.pin === pin
    );
    if (!cashier) throw new Error('Invalid Username or PIN code for this outlet.');

    const sessionUser: UserProfile = {
      id: cashier.id, email: adminProfile.email,
      role: 'cashier', store_id: adminProfile.store_id, name: cashier.name
    };
    localStorage.setItem('kasirnya_current_user', JSON.stringify(sessionUser));
    return sessionUser;
  },

  async resetPassword(email: string): Promise<void> {
    if (supabase) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin
      });
      if (error) throw error;
    } else {
      throw new Error('Supabase is not configured. Password recovery requires cloud database.');
    }
  },

  async updatePassword(password: string): Promise<void> {
    if (supabase) {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
    } else {
      throw new Error('Supabase is not configured.');
    }
  }
};
