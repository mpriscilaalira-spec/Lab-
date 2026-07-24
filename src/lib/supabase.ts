import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Contact, SupabaseConfig, StorageStatus } from '../types';

const CONFIG_KEY = 'supabase_contact_app_config';
const LOCAL_STORAGE_CONTACTS_KEY = 'contacts_local_db_v1';

// Default initial config from environment or empty
export function getSavedSupabaseConfig(): SupabaseConfig {
  const envUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

  try {
    const saved = localStorage.getItem(CONFIG_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        url: (parsed.url || envUrl).trim(),
        anonKey: (parsed.anonKey || envKey).trim(),
        tableName: (parsed.tableName || 'contacts').trim(),
      };
    }
  } catch (e) {
    console.error('Erro ao carregar configurações do Supabase do localStorage:', e);
  }

  return {
    url: envUrl,
    anonKey: envKey,
    tableName: 'contacts',
  };
}

export function saveSupabaseConfig(config: SupabaseConfig): void {
  try {
    const cleanedConfig: SupabaseConfig = {
      url: config.url.trim().replace(/\/+$/, ''),
      anonKey: config.anonKey.trim(),
      tableName: config.tableName.trim() || 'contacts',
    };
    localStorage.setItem(CONFIG_KEY, JSON.stringify(cleanedConfig));
  } catch (e) {
    console.error('Erro ao salvar configurações do Supabase:', e);
  }
}

// Global Supabase client instance
let supabaseClientInstance: SupabaseClient | null = null;

export function getSupabaseClient(configOverride?: SupabaseConfig): SupabaseClient | null {
  const config = configOverride || getSavedSupabaseConfig();
  
  let rawUrl = (config.url || '').trim().replace(/\/+$/, '');
  const rawKey = (config.anonKey || '').trim();

  if (!rawUrl || !rawKey) {
    supabaseClientInstance = null;
    return null;
  }

  if (!rawUrl.startsWith('http://') && !rawUrl.startsWith('https://')) {
    rawUrl = `https://${rawUrl}`;
  }

  try {
    // Validate basic URL format
    new URL(rawUrl);
    supabaseClientInstance = createClient(rawUrl, rawKey, {
      auth: {
        persistSession: false, // Simple anonymous or public access for contacts demo
      },
    });
    return supabaseClientInstance;
  } catch (e) {
    console.error('URL do Supabase inválida ou falha na criação do cliente:', e);
    supabaseClientInstance = null;
    return null;
  }
}

// Local Storage Fallback helpers
export function getLocalContacts(): Contact[] {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_CONTACTS_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Erro ao ler contatos locais:', e);
  }
  // Default mock dataset if empty
  const defaultContacts: Contact[] = [
    {
      id: '1',
      name: 'Ana Silva',
      phone: '(11) 98765-4321',
      email: 'ana.silva@exemplo.com.br',
      address: 'Av. Paulista, 1000 - Bela Vista, São Paulo - SP',
      category: 'Trabalho',
      is_favorite: true,
      notes: 'Gerente de Projetos',
      created_at: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Carlos Oliveira',
      phone: '(21) 99123-8877',
      email: 'carlos.oliveira@email.com',
      address: 'Rua Visconde de Pirajá, 250 - Ipanema, Rio de Janeiro - RJ',
      category: 'Pessoal',
      is_favorite: false,
      notes: 'Amigo da faculdade',
      created_at: new Date(Date.now() - 86400000).toISOString(),
    }
  ];
  saveLocalContacts(defaultContacts);
  return defaultContacts;
}

export function saveLocalContacts(contacts: Contact[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_CONTACTS_KEY, JSON.stringify(contacts));
  } catch (e) {
    console.error('Erro ao salvar contatos locais:', e);
  }
}

// Connection test
export async function testSupabaseConnection(config?: SupabaseConfig): Promise<StorageStatus> {
  const currentConfig = config || getSavedSupabaseConfig();
  const rawUrl = (currentConfig.url || '').trim();
  const rawKey = (currentConfig.anonKey || '').trim();
  
  if (!rawUrl || !rawKey) {
    return {
      mode: 'local',
      isConnected: false,
      message: 'Supabase não configurado. Utilizando armazenamento local.',
      error: 'URL ou Chave Anon ausentes.',
    };
  }

  // Check if user accidentally entered api.supabase.com management domain
  if (rawUrl.toLowerCase().includes('api.supabase.com')) {
    return {
      mode: 'local',
      isConnected: false,
      message: 'URL do Supabase incorreta!',
      error: 'Você inseriu a URL de gerenciamento "api.supabase.com". A URL do seu projeto deve ser no formato: https://SEU_PROJETO.supabase.co (encontrada em Settings > API > Project URL no painel Supabase).',
    };
  }

  const client = getSupabaseClient(currentConfig);
  if (!client) {
    return {
      mode: 'local',
      isConnected: false,
      message: 'Não foi possível inicializar o cliente Supabase.',
      error: 'URL do Supabase com formato inválido. Use: https://sua-id.supabase.co',
    };
  }

  try {
    const { data, error } = await client
      .from(currentConfig.tableName || 'contacts')
      .select('count', { count: 'exact', head: true });

    if (error) {
      let friendlyError = `${error.message} (${error.code || 'sem código'})`;
      if (error.message.includes('relation') && error.message.includes('does not exist')) {
        friendlyError = `A tabela '${currentConfig.tableName}' não existe no Supabase. Vá na aba 'Código SQL da Tabela', copie o script e execute-o no SQL Editor do Supabase.`;
      }
      return {
        mode: 'local',
        isConnected: false,
        message: 'Erro ao conectar com a tabela do Supabase.',
        error: friendlyError,
      };
    }

    return {
      mode: 'supabase',
      isConnected: true,
      message: 'Conectado com sucesso ao Supabase!',
      error: null,
    };
  } catch (err: any) {
    const errMsg = err?.message || String(err);
    let friendly = errMsg;
    if (errMsg.includes('Failed to fetch')) {
      friendly = 'Falha ao buscar dados (Failed to fetch). Certifique-se de que a Project URL seja "https://SEU_ID.supabase.co" e não "api.supabase.com", e que sua conexão com a internet esteja ativa.';
    }
    return {
      mode: 'local',
      isConnected: false,
      message: 'Falha na comunicação com o Supabase.',
      error: friendly,
    };
  }
}

// Contacts API abstraction (Supabase with Local fallback)
export async function fetchAllContacts(): Promise<{ contacts: Contact[]; status: StorageStatus }> {
  const config = getSavedSupabaseConfig();
  const client = getSupabaseClient(config);

  if (!client) {
    return {
      contacts: getLocalContacts(),
      status: {
        mode: 'local',
        isConnected: false,
        message: 'Armazenamento Local ativo (Supabase não configurado)',
      },
    };
  }

  try {
    const { data, error } = await client
      .from(config.tableName || 'contacts')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.warn('Erro ao carregar do Supabase, usando fallback local:', error.message);
      return {
        contacts: getLocalContacts(),
        status: {
          mode: 'local',
          isConnected: false,
          message: 'Erro no Supabase. Exibindo dados locais.',
          error: error.message,
        },
      };
    }

    return {
      contacts: (data as Contact[]) || [],
      status: {
        mode: 'supabase',
        isConnected: true,
        message: 'Dados sincronizados diretamente do Supabase',
      },
    };
  } catch (e: any) {
    return {
      contacts: getLocalContacts(),
      status: {
        mode: 'local',
        isConnected: false,
        message: 'Exceção de rede no Supabase',
        error: e?.message,
      },
    };
  }
}

export async function createContact(newContact: Omit<Contact, 'id' | 'created_at'>): Promise<{ contact: Contact; isSupabase: boolean }> {
  const config = getSavedSupabaseConfig();
  const client = getSupabaseClient(config);
  const now = new Date().toISOString();

  if (client) {
    try {
      const payload = {
        name: newContact.name,
        phone: newContact.phone,
        email: newContact.email,
        address: newContact.address,
        category: newContact.category || 'Geral',
        is_favorite: newContact.is_favorite || false,
        notes: newContact.notes || '',
        updated_at: now,
      };

      const { data, error } = await client
        .from(config.tableName || 'contacts')
        .insert([payload])
        .select()
        .single();

      if (!error && data) {
        // Also sync local cache
        const local = getLocalContacts();
        saveLocalContacts([data as Contact, ...local]);
        return { contact: data as Contact, isSupabase: true };
      }
      console.warn('Erro ao inserir no Supabase, salvando localmente:', error?.message);
    } catch (err) {
      console.error('Falha de inserção no Supabase:', err);
    }
  }

  // Fallback to local
  const createdLocal: Contact = {
    ...newContact,
    id: 'loc_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
    created_at: now,
    updated_at: now,
  };
  const current = getLocalContacts();
  saveLocalContacts([createdLocal, ...current]);
  return { contact: createdLocal, isSupabase: false };
}

export async function updateContactService(id: string, updatedData: Partial<Contact>): Promise<{ isSupabase: boolean }> {
  const config = getSavedSupabaseConfig();
  const client = getSupabaseClient(config);
  const now = new Date().toISOString();

  // Always update local cache
  const localList = getLocalContacts();
  const updatedLocal = localList.map(c => (c.id === id ? { ...c, ...updatedData, updated_at: now } : c));
  saveLocalContacts(updatedLocal);

  if (client && !id.startsWith('loc_')) {
    try {
      const { error } = await client
        .from(config.tableName || 'contacts')
        .update({
          ...updatedData,
          updated_at: now,
        })
        .eq('id', id);

      if (!error) {
        return { isSupabase: true };
      }
    } catch (err) {
      console.error('Erro ao atualizar no Supabase:', err);
    }
  }

  return { isSupabase: false };
}

export async function deleteContactService(id: string): Promise<{ isSupabase: boolean }> {
  const config = getSavedSupabaseConfig();
  const client = getSupabaseClient(config);

  // Update local
  const localList = getLocalContacts();
  const filtered = localList.filter(c => c.id !== id);
  saveLocalContacts(filtered);

  if (client && !id.startsWith('loc_')) {
    try {
      const { error } = await client
        .from(config.tableName || 'contacts')
        .delete()
        .eq('id', id);

      if (!error) {
        return { isSupabase: true };
      }
    } catch (err) {
      console.error('Erro ao excluir no Supabase:', err);
    }
  }

  return { isSupabase: false };
}

// Bulk sync local contacts into Supabase
export async function syncLocalToSupabase(): Promise<{ syncedCount: number; error: string | null }> {
  const config = getSavedSupabaseConfig();
  const client = getSupabaseClient(config);

  if (!client) {
    return { syncedCount: 0, error: 'Supabase não está configurado ou acessível.' };
  }

  const localContacts = getLocalContacts();
  if (localContacts.length === 0) {
    return { syncedCount: 0, error: null };
  }

  try {
    const payload = localContacts.map(c => ({
      name: c.name,
      phone: c.phone,
      email: c.email,
      address: c.address,
      category: c.category || 'Geral',
      is_favorite: c.is_favorite || false,
      notes: c.notes || '',
    }));

    const { data, error } = await client
      .from(config.tableName || 'contacts')
      .insert(payload)
      .select();

    if (error) {
      return { syncedCount: 0, error: error.message };
    }

    return { syncedCount: data ? data.length : payload.length, error: null };
  } catch (e: any) {
    return { syncedCount: 0, error: e?.message || 'Erro inesperado na sincronização.' };
  }
}
