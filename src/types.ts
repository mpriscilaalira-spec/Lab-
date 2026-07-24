export type ContactCategory = 'Geral' | 'Pessoal' | 'Trabalho' | 'Cliente' | 'Família' | 'Outro';

export interface Contact {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  category?: ContactCategory;
  is_favorite?: boolean;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  tableName: string;
}

export type StorageMode = 'supabase' | 'local';

export interface StorageStatus {
  mode: StorageMode;
  isConnected: boolean;
  message: string;
  error?: string | null;
}
