import React, { useState, useMemo } from 'react';
import { 
  Search, 
  LayoutGrid, 
  List as ListIcon, 
  Download, 
  UserPlus, 
  Filter, 
  Star, 
  Phone, 
  Mail, 
  MapPin, 
  Edit3, 
  Trash2,
  XCircle,
  MessageCircle
} from 'lucide-react';
import { Contact, ContactCategory } from '../types';
import { ContactCard } from './ContactCard';

interface ContactListProps {
  contacts: Contact[];
  isLoading: boolean;
  onEdit: (contact: Contact) => void;
  onDelete: (contact: Contact) => void;
  onToggleFavorite: (contact: Contact) => void;
  onNewContact: () => void;
}

export const ContactList: React.FC<ContactListProps> = ({
  contacts,
  isLoading,
  onEdit,
  onDelete,
  onToggleFavorite,
  onNewContact,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  // Filtered contacts
  const filteredContacts = useMemo(() => {
    return contacts.filter((contact) => {
      // Search text match
      const query = searchTerm.toLowerCase();
      const matchesSearch =
        !query ||
        contact.name.toLowerCase().includes(query) ||
        contact.phone.toLowerCase().includes(query) ||
        contact.email.toLowerCase().includes(query) ||
        contact.address.toLowerCase().includes(query) ||
        (contact.notes && contact.notes.toLowerCase().includes(query));

      // Category match
      const matchesCategory =
        selectedCategory === 'ALL' || contact.category === selectedCategory;

      // Favorites match
      const matchesFavorites = !onlyFavorites || contact.is_favorite;

      return matchesSearch && matchesCategory && matchesFavorites;
    });
  }, [contacts, searchTerm, selectedCategory, onlyFavorites]);

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredContacts.length === 0) return;

    const headers = ['Nome', 'Telefone', 'Email', 'Endereço', 'Categoria', 'Favorito', 'Observações'];
    const rows = filteredContacts.map((c) => [
      `"${c.name.replace(/"/g, '""')}"`,
      `"${c.phone.replace(/"/g, '""')}"`,
      `"${c.email.replace(/"/g, '""')}"`,
      `"${c.address.replace(/"/g, '""')}"`,
      `"${(c.category || 'Geral').replace(/"/g, '""')}"`,
      c.is_favorite ? 'Sim' : 'Não',
      `"${(c.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `contatos_supabase_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const categoriesList = ['ALL', 'Trabalho', 'Pessoal', 'Cliente', 'Família', 'Geral', 'Outro'];

  return (
    <div id="contact-list-container" className="space-y-6">
      
      {/* Search Bar & Filters Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-sm space-y-4">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome, telefone, e-mail ou endereço..."
              className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                <XCircle className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-2 self-end md:self-auto">
            
            {/* Favorites Toggle Button */}
            <button
              onClick={() => setOnlyFavorites(!onlyFavorites)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                onlyFavorites
                  ? 'bg-amber-50 text-amber-700 border-amber-300'
                  : 'bg-slate-50 text-slate-600 hover:text-slate-900 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-amber-400 text-amber-500' : ''}`} />
              <span>Favoritos</span>
            </button>

            {/* Export CSV */}
            <button
              onClick={handleExportCSV}
              disabled={filteredContacts.length === 0}
              title="Exportar contatos para CSV"
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Exportar</span>
            </button>

            {/* View Mode Switcher */}
            <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                title="Visualização em Grade"
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                title="Visualização em Tabela"
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                <ListIcon className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 scrollbar-none text-xs">
          <span className="text-slate-500 font-semibold mr-1 flex items-center gap-1 shrink-0">
            <Filter className="w-3 h-3" /> Categoria:
          </span>
          {categoriesList.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full border whitespace-nowrap transition-all font-bold cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {cat === 'ALL' ? 'Todas' : cat}
              </button>
            );
          })}
        </div>

      </div>

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 animate-pulse shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-4 bg-slate-100 rounded w-2/3" />
                  <div className="h-3 bg-slate-100/60 rounded w-1/3" />
                </div>
              </div>
              <div className="space-y-2 pt-2">
                <div className="h-3 bg-slate-100 rounded w-full" />
                <div className="h-3 bg-slate-100 rounded w-4/5" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredContacts.length === 0 ? (
        
        /* Empty State */
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-lg mx-auto my-8 shadow-sm">
          <div className="w-16 h-16 bg-slate-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-200">
            <UserPlus className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">Nenhum contato encontrado</h3>
          <p className="text-xs text-slate-500 mb-6 max-w-sm mx-auto">
            {searchTerm || selectedCategory !== 'ALL' || onlyFavorites
              ? 'Nenhum resultado corresponde aos filtros aplicados. Tente limpar a busca.'
              : 'Sua lista de contatos está vazia. Cadastre seu primeiro contato para começar!'}
          </p>
          {searchTerm || selectedCategory !== 'ALL' || onlyFavorites ? (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('ALL');
                setOnlyFavorites(false);
              }}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-800 rounded-xl border border-slate-200 transition-colors cursor-pointer"
            >
              Limpar Filtros
            </button>
          ) : (
            <button
              onClick={onNewContact}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
            >
              Adicionar Primeiro Contato
            </button>
          )}
        </div>

      ) : viewMode === 'grid' ? (

        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredContacts.map((contact) => (
            <ContactCard
              key={contact.id}
              contact={contact}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>

      ) : (

        /* TABLE / LIST VIEW */
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Nome</th>
                  <th className="py-3.5 px-4">Telefone</th>
                  <th className="py-3.5 px-4">E-mail</th>
                  <th className="py-3.5 px-4">Endereço</th>
                  <th className="py-3.5 px-4">Categoria</th>
                  <th className="py-3.5 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredContacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-slate-50/80 transition-colors">
                    
                    {/* Name */}
                    <td className="py-3 px-4 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onToggleFavorite(contact)}
                          className="text-slate-300 hover:text-amber-500 transition-colors cursor-pointer"
                        >
                          <Star className={`w-3.5 h-3.5 ${contact.is_favorite ? 'text-amber-500 fill-amber-400' : ''}`} />
                        </button>
                        <span>{contact.name}</span>
                      </div>
                    </td>

                    {/* Phone */}
                    <td className="py-3 px-4 font-mono text-slate-800">
                      {contact.phone ? (
                        <div className="flex items-center gap-2">
                          <span>{contact.phone}</span>
                          <a
                            href={`https://wa.me/${contact.phone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-600 hover:text-emerald-700"
                            title="WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    {/* Email */}
                    <td className="py-3 px-4 text-slate-700">
                      {contact.email || <span className="text-slate-400">-</span>}
                    </td>

                    {/* Address */}
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                      {contact.address || <span className="text-slate-400">-</span>}
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                        {contact.category || 'Geral'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onEdit(contact)}
                          className="p-1.5 text-slate-600 hover:text-slate-900 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                          title="Editar"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(contact)}
                          className="p-1.5 text-rose-600 hover:text-rose-700 rounded hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      )}

    </div>
  );
};
