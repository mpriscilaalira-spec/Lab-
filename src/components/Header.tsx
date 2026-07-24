import React from 'react';
import { UserPlus, Database, CheckCircle2, AlertTriangle, Settings, RefreshCw, HardDrive } from 'lucide-react';
import { StorageStatus } from '../types';

interface HeaderProps {
  status: StorageStatus;
  onOpenConfig: () => void;
  onNewContact: () => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  status,
  onOpenConfig,
  onNewContact,
  onRefresh,
  isLoading,
}) => {
  return (
    <header id="main-app-header" className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-bold shadow-sm">
              <Database className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-white tracking-tight">Supabase CRM</h1>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  v1.0
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Gerenciamento de contatos integrado ao banco de dados
              </p>
            </div>
          </div>

          {/* Controls & Connection Status */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            
            {/* Storage Status Badge */}
            <button
              id="storage-status-badge"
              onClick={onOpenConfig}
              title="Clique para configurar o Supabase"
              className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
                status.mode === 'supabase' && status.isConnected
                  ? 'bg-slate-800 text-emerald-400 border-slate-700 hover:bg-slate-700'
                  : 'bg-amber-950/40 text-amber-300 border-amber-800/80 hover:bg-amber-900/40'
              }`}
            >
              {status.mode === 'supabase' && status.isConnected ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Supabase Conectado</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 ml-1" />
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  <span>Modo Local</span>
                  <AlertTriangle className="w-3 h-3 text-amber-400 ml-0.5" />
                </>
              )}
            </button>

            {/* Refresh Button */}
            <button
              id="btn-refresh-data"
              onClick={onRefresh}
              disabled={isLoading}
              title="Atualizar lista"
              className="p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            {/* Settings Config Button */}
            <button
              id="btn-open-supabase-config"
              onClick={onOpenConfig}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors"
            >
              <Settings className="w-4 h-4 text-emerald-400" />
              <span className="hidden md:inline">Configurações</span>
            </button>

            {/* New Contact Primary Button */}
            <button
              id="btn-new-contact-header"
              onClick={onNewContact}
              className="flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg shadow-sm transition-all cursor-pointer ml-auto sm:ml-0"
            >
              <UserPlus className="w-4 h-4" />
              <span>Novo Contato</span>
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};
