import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { StatsBar } from './components/StatsBar';
import { ContactList } from './components/ContactList';
import { ContactFormModal } from './components/ContactFormModal';
import { SupabaseConfigModal } from './components/SupabaseConfigModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { Contact, StorageStatus } from './types';
import { 
  fetchAllContacts, 
  createContact, 
  updateContactService, 
  deleteContactService,
  testSupabaseConnection 
} from './lib/supabase';
import { CheckCircle2, AlertCircle, Sparkles, Database } from 'lucide-react';

export default function App() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [status, setStatus] = useState<StorageStatus>({
    mode: 'local',
    isConnected: false,
    message: 'Carregando estado de armazenamento...',
  });

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  const [isConfigOpen, setIsConfigOpen] = useState(false);

  const [deletingContact, setDeletingContact] = useState<Contact | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast notification state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Load contacts and storage status
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const { contacts: loadedContacts, status: currentStatus } = await fetchAllContacts();
      setContacts(loadedContacts);
      setStatus(currentStatus);
    } catch (error) {
      console.error('Erro ao carregar contatos:', error);
      showToast('Erro ao carregar a lista de contatos.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStatusCheck = async () => {
    const newStatus = await testSupabaseConnection();
    setStatus(newStatus);
    loadData();
  };

  // Create / Update Contact
  const handleSaveContact = async (
    contactData: Omit<Contact, 'id' | 'created_at'> & { id?: string }
  ) => {
    if (contactData.id) {
      // Update
      const { isSupabase } = await updateContactService(contactData.id, contactData);
      showToast(
        isSupabase 
          ? 'Contato atualizado com sucesso no Supabase!' 
          : 'Contato atualizado no armazenamento local.'
      );
    } else {
      // Create
      const { isSupabase } = await createContact(contactData);
      showToast(
        isSupabase 
          ? 'Novo contato salvo com sucesso no Supabase!' 
          : 'Contato salvo no modo local.'
      );
    }
    loadData();
  };

  // Toggle Favorite
  const handleToggleFavorite = async (contact: Contact) => {
    const updated = !contact.is_favorite;
    await updateContactService(contact.id, { is_favorite: updated });
    setContacts((prev) =>
      prev.map((c) => (c.id === contact.id ? { ...c, is_favorite: updated } : c))
    );
    showToast(
      updated ? `"${contact.name}" marcado como favorito!` : `"${contact.name}" removido dos favoritos.`
    );
  };

  // Delete Contact
  const handleConfirmDelete = async (contactId: string) => {
    setIsDeleting(true);
    try {
      const { isSupabase } = await deleteContactService(contactId);
      showToast(
        isSupabase 
          ? 'Contato removido do Supabase.' 
          : 'Contato removido do armazenamento local.'
      );
      setDeletingContact(null);
      loadData();
    } catch (err) {
      showToast('Falha ao excluir o contato.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* Toast Notification Banner */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-bounce">
          <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-xl text-xs font-semibold ${
            toast.type === 'success'
              ? 'bg-slate-900 text-white border-slate-800 shadow-slate-900/10'
              : 'bg-rose-900 text-white border-rose-800 shadow-rose-900/10'
          }`}>
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Main App Header */}
      <Header
        status={status}
        onOpenConfig={() => setIsConfigOpen(true)}
        onNewContact={() => {
          setEditingContact(null);
          setIsFormOpen(true);
        }}
        onRefresh={loadData}
        isLoading={isLoading}
      />

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        
        {/* Banner callout if in Local Mode */}
        {status.mode === 'local' && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-sm">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-100 text-amber-700 rounded-lg shrink-0 mt-0.5 sm:mt-0">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-amber-900">Modo de Armazenamento Local Ativo</p>
                <p className="text-amber-800 mt-0.5">
                  Os contatos estão sendo armazenados no seu navegador. Conecte sua conta do Supabase para sincronizar na nuvem.
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsConfigOpen(true)}
              className="px-3.5 py-2 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-all shrink-0 cursor-pointer shadow-sm"
            >
              Conectar Supabase
            </button>
          </div>
        )}

        {/* Stats Overview */}
        <StatsBar contacts={contacts} status={status} />

        {/* Main Contacts List with Filters & Search */}
        <ContactList
          contacts={contacts}
          isLoading={isLoading}
          onEdit={(contact) => {
            setEditingContact(contact);
            setIsFormOpen(true);
          }}
          onDelete={(contact) => setDeletingContact(contact)}
          onToggleFavorite={handleToggleFavorite}
          onNewContact={() => {
            setEditingContact(null);
            setIsFormOpen(true);
          }}
        />

      </main>

      {/* Modals */}
      <ContactFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveContact}
        editingContact={editingContact}
      />

      <SupabaseConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        status={status}
        onStatusUpdated={handleStatusCheck}
      />

      <DeleteConfirmModal
        isOpen={!!deletingContact}
        contact={deletingContact}
        onClose={() => setDeletingContact(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />

      {/* App Footer */}
      <footer className="bg-white border-t border-slate-200 py-5 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-medium text-slate-600">
            Supabase CRM • Gerenciador de Contatos Profissional
          </p>
          <p className="text-[11px] text-slate-400">
            Nome, telefone, e-mail, endereço e anotações armazenadas com segurança.
          </p>
        </div>
      </footer>

    </div>
  );
}
