import React from 'react';
import { Users, Star, FolderGit2, Database } from 'lucide-react';
import { Contact, StorageStatus } from '../types';

interface StatsBarProps {
  contacts: Contact[];
  status: StorageStatus;
}

export const StatsBar: React.FC<StatsBarProps> = ({ contacts, status }) => {
  const total = contacts.length;
  const favorites = contacts.filter((c) => c.is_favorite).length;
  
  const categories = Array.from(
    new Set(contacts.map((c) => c.category || 'Geral'))
  ).length;

  return (
    <div id="stats-summary-bar" className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
      
      {/* Total Contatos */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3 shadow-sm">
        <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100">
          <Users className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total de Contatos</p>
          <p className="text-2xl font-bold text-slate-800 mt-0.5">{total}</p>
        </div>
      </div>

      {/* Favoritos */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3 shadow-sm">
        <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg border border-amber-100">
          <Star className="w-5 h-5 fill-amber-400" />
        </div>
        <div>
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Favoritos</p>
          <p className="text-2xl font-bold text-slate-800 mt-0.5">{favorites}</p>
        </div>
      </div>

      {/* Categorias */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3 shadow-sm">
        <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-100">
          <FolderGit2 className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Categorias Ativas</p>
          <p className="text-2xl font-bold text-slate-800 mt-0.5">{categories}</p>
        </div>
      </div>

      {/* Armazenamento */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3 shadow-sm">
        <div className={`p-2.5 rounded-lg border ${
          status.mode === 'supabase' && status.isConnected
            ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
            : 'bg-amber-50 text-amber-600 border-amber-100'
        }`}>
          <Database className="w-5 h-5" />
        </div>
        <div className="overflow-hidden">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Banco de Dados</p>
          <p className="text-sm font-bold text-slate-800 mt-1 truncate">
            {status.mode === 'supabase' && status.isConnected
              ? 'Supabase Cloud'
              : 'Navegador Local'}
          </p>
        </div>
      </div>

    </div>
  );
};
