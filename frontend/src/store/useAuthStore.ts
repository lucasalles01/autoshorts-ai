import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface AuthState {
  user: any | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,

  initialize: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    set({ user: session?.user || null, loading: false });

    supabase.auth.onAuthStateChange((_event, session) => {
      set({ user: session?.user || null, loading: false });
    });
  },

  signIn: async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  },

  signUp: async (email: string, password: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }
      }
    });
    
    if (error) {
      // Provide more specific error messages
      if (error.message.includes('already registered')) {
        throw new Error('Este e-mail já está cadastrado. Faça login ao invés de criar uma nova conta.');
      } else if (error.message.includes('Invalid email')) {
        throw new Error('E-mail inválido. Verifique o formato do e-mail.');
      } else if (error.message.includes('password')) {
        throw new Error('A senha deve ter pelo menos 6 caracteres.');
      } else {
        throw new Error(error.message || 'Erro ao criar conta. Tente novamente.');
      }
    }
    
    // If signup was successful and user is automatically logged in, redirect will happen via auth state change
    // If email confirmation is required, inform the user
    if (data.user && !data.session) {
      throw new Error('Conta criada com sucesso! Por favor, verifique seu e-mail para confirmar o cadastro.');
    }
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    set({ user: null });
  }
}));