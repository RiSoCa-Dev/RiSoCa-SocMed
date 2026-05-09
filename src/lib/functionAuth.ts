import { supabase, supabaseAnonKey } from './supabase';

export async function getOwnerFunctionHeaders(): Promise<HeadersInit> {
  const { data, error } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  if (error || !token || !supabaseAnonKey) {
    throw new Error('Owner session is required. Please sign in again.');
  }

  return {
    apikey: supabaseAnonKey,
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}
