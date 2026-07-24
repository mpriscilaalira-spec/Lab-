import React, { useState, useEffect } from 'react';
import { 
  X, 
  Database, 
  Key, 
  Code2, 
  Copy, 
  Check, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Upload,
  Info,
  Server
} from 'lucide-react';
import { SupabaseConfig, StorageStatus } from '../types';
import { 
  getSavedSupabaseConfig, 
  saveSupabaseConfig, 
  testSupabaseConnection,
  syncLocalToSupabase 
} from '../lib/supabase';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: StorageStatus;
  onStatusUpdated: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({
  isOpen,
  onClose,
  status,
  onStatusUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<'config' | 'sql' | 'sync'>('config');
  
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [tableName, setTableName] = useState('contacts');

  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<StorageStatus | null>(null);

  const [copiedSql, setCopiedSql] = useState(false);

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const config = getSavedSupabaseConfig();
      setUrl(config.url || '');
      setAnonKey(config.anonKey || '');
      setTableName(config.tableName || 'contacts');
      setTestResult(status);
      setSyncFeedback(null);
    }
  }, [isOpen, status]);

  if (!isOpen) return null;

  const handleSaveAndTest = async () => {
    const config: SupabaseConfig = {
      url: url.trim(),
      anonKey: anonKey.trim(),
      tableName: tableName.trim() || 'contacts',
    };

    saveSupabaseConfig(config);
    setIsTesting(true);

    const result = await testSupabaseConnection(config);
    setTestResult(result);
    setIsTesting(false);

    onStatusUpdated();
  };

  const sqlScript = `-- ========================================================
-- 1. CRIAR A TABELA DE CONTATOS NO SUPABASE
-- ========================================================
create table if not exists public.${tableName || 'contacts'} (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  phone text,
  email text,
  address text,
  category text default 'Geral',
  is_favorite boolean default false,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- ========================================================
-- 2. HABILITAR ROW LEVEL SECURITY (RLS) NA TABELA DE DADOS
-- ========================================================
alter table public.${tableName || 'contacts'} enable row level security;

-- Limpar políticas anteriores se existirem
drop policy if exists "Permitir leitura publica de contatos" on public.${tableName || 'contacts'};
drop policy if exists "Permitir insercao publica de contatos" on public.${tableName || 'contacts'};
drop policy if exists "Permitir edicao publica de contatos" on public.${tableName || 'contacts'};
drop policy if exists "Permitir exclusao publica de contatos" on public.${tableName || 'contacts'};

-- Políticas RLS para a Tabela de Contatos (SELECT, INSERT, UPDATE, DELETE)
create policy "Permitir leitura publica de contatos"
  on public.${tableName || 'contacts'} for select
  using (true);

create policy "Permitir insercao publica de contatos"
  on public.${tableName || 'contacts'} for insert
  with check (true);

create policy "Permitir edicao publica de contatos"
  on public.${tableName || 'contacts'} for update
  using (true)
  with check (true);

create policy "Permitir exclusao publica de contatos"
  on public.${tableName || 'contacts'} for delete
  using (true);

-- ========================================================
-- 3. CONFIGURAR BUCKET E POLÍTICAS DE ARMAZENAMENTO (STORAGE)
-- ========================================================
-- Criar bucket público de armazenamento para arquivos/avatares
insert into storage.buckets (id, name, public)
values ('contact_avatars', 'contact_avatars', true)
on conflict (id) do nothing;

-- Nota: A tabela storage.objects já tem RLS habilitado por padrão pelo Supabase.
-- Limpar políticas anteriores de storage se existirem
drop policy if exists "Permitir leitura publica no storage" on storage.objects;
drop policy if exists "Permitir upload publico no storage" on storage.objects;
drop policy if exists "Permitir atualizacao publica no storage" on storage.objects;
drop policy if exists "Permitir exclusao publica no storage" on storage.objects;

-- Políticas de RLS de Armazenamento (Storage Policies)
create policy "Permitir leitura publica no storage"
  on storage.objects for select
  using (bucket_id = 'contact_avatars');

create policy "Permitir upload publico no storage"
  on storage.objects for insert
  with check (bucket_id = 'contact_avatars');

create policy "Permitir atualizacao publica no storage"
  on storage.objects for update
  using (bucket_id = 'contact_avatars');

create policy "Permitir exclusao publica no storage"
  on storage.objects for delete
  using (bucket_id = 'contact_avatars');
`;

  const copySqlToClipboard = () => {
    navigator.clipboard.writeText(sqlScript);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleSyncLocalData = async () => {
    setIsSyncing(true);
    setSyncFeedback(null);

    const res = await syncLocalToSupabase();
    setIsSyncing(false);

    if (res.error) {
      setSyncFeedback(`Erro na sincronização: ${res.error}`);
    } else {
      setSyncFeedback(`Sucesso! ${res.syncedCount} contatos sincronizados para o Supabase.`);
      onStatusUpdated();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div 
        id="supabase-config-modal"
        className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl border border-emerald-200">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Configuração do Supabase</h2>
              <p className="text-xs text-slate-500">Gerencie a conexão e o esquema do banco de dados</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50/50 px-6">
          <button
            onClick={() => setActiveTab('config')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'config'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>Credenciais & Conexão</span>
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'sql'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Código SQL da Tabela</span>
          </button>
          <button
            onClick={() => setActiveTab('sync')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'sync'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Sincronizar Dados</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          
          {/* TAB 1: CONFIG */}
          {activeTab === 'config' && (
            <div className="space-y-4">
              
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3 text-xs text-slate-600">
                <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p>
                  Insira a URL do seu projeto e a chave <span className="font-mono text-emerald-700 font-bold">anon/public</span> do seu painel Supabase (<span className="text-slate-500">Settings &gt; API</span>).
                </p>
              </div>

              {/* URL */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Supabase Project URL <span className="text-slate-400 font-normal">(ex: https://xyzcompany.supabase.co)</span>
                </label>
                <div className="relative">
                  <Server className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://xyzcompany.supabase.co"
                    className={`w-full bg-slate-50 border rounded-xl pl-9 pr-3 py-2.5 text-xs font-mono outline-none transition-all ${
                      url.toLowerCase().includes('api.supabase.com')
                        ? 'border-rose-500 focus:ring-1 focus:ring-rose-500 text-rose-800'
                        : 'border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-slate-800'
                    }`}
                  />
                </div>
                {url.toLowerCase().includes('api.supabase.com') && (
                  <p className="text-[11px] font-semibold text-rose-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    Atenção: Não use &quot;api.supabase.com&quot;. Copie a &quot;Project URL&quot; no formato https://SUA-ID.supabase.co em Settings &gt; API no Supabase.
                  </p>
                )}
              </div>

              {/* ANON KEY */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Supabase Anon Key (pública)
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={anonKey}
                    onChange={(e) => setAnonKey(e.target.value)}
                    placeholder="eyJhY2Nlc3NfdG9rZW4iOiJ..."
                    className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-800 font-mono placeholder-slate-400 outline-none"
                  />
                </div>
              </div>

              {/* TABLE NAME */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nome da Tabela no Supabase
                </label>
                <input
                  type="text"
                  value={tableName}
                  onChange={(e) => setTableName(e.target.value)}
                  placeholder="contacts"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono placeholder-slate-400 outline-none"
                />
              </div>

              {/* Test Result Feedback */}
              {testResult && (
                <div className={`p-4 rounded-xl border flex items-start gap-3 text-xs ${
                  testResult.isConnected
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-amber-50 border-amber-200 text-amber-800'
                }`}>
                  {testResult.isConnected ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="font-bold">{testResult.message}</p>
                    {testResult.error && (
                      <p className="mt-1 font-mono text-[11px] opacity-90">{testResult.error}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Save & Test Action */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleSaveAndTest}
                  disabled={isTesting}
                  className="flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw className={`w-4 h-4 ${isTesting ? 'animate-spin' : ''}`} />
                  <span>{isTesting ? 'Testando Conexão...' : 'Salvar e Testar Conexão'}</span>
                </button>
              </div>

            </div>
          )}

          {/* TAB 2: SQL SCRIPT */}
          {activeTab === 'sql' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-600">
                Copie e cole este comando SQL no <span className="font-bold text-emerald-700">SQL Editor</span> do seu painel Supabase para criar a tabela com os campos necessários:
              </p>

              <div className="relative bg-slate-900 border border-slate-800 rounded-xl p-4 font-mono text-[11px] text-emerald-300/90 overflow-x-auto max-h-60 leading-relaxed shadow-inner">
                <pre>{sqlScript}</pre>
                <button
                  onClick={copySqlToClipboard}
                  className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-700 text-xs transition-colors cursor-pointer"
                >
                  {copiedSql ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar SQL</span>
                    </>
                  )}
                </button>
              </div>

              <div className="text-[11px] text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
                <p className="font-bold text-slate-800">💡 Instruções no Supabase:</p>
                <p>1. Acesse <span className="text-emerald-700 font-semibold">supabase.com</span> e entre no seu projeto.</p>
                <p>2. Clique em <span className="text-emerald-700 font-semibold">SQL Editor</span> no menu lateral esquerdo.</p>
                <p>3. Cole o script acima e clique em <span className="text-emerald-700 font-bold">Run</span>.</p>
              </div>
            </div>
          )}

          {/* TAB 3: SYNC DATA */}
          {activeTab === 'sync' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs text-slate-600">
                <h4 className="font-bold text-slate-800 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-emerald-600" />
                  Sincronização de Contatos Locais
                </h4>
                <p>
                  Caso você tenha adicionado contatos no modo local antes de configurar o Supabase, você pode enviar todos os seus contatos para a tabela do Supabase com apenas 1 clique.
                </p>
              </div>

              {syncFeedback && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-emerald-800 font-mono">
                  {syncFeedback}
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleSyncLocalData}
                  disabled={isSyncing || !status.isConnected}
                  className="flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  <Upload className={`w-4 h-4 ${isSyncing ? 'animate-bounce' : ''}`} />
                  <span>{isSyncing ? 'Sincronizando...' : 'Enviar Contatos para o Supabase'}</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-200 transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
