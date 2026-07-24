import React, { useState, useEffect } from 'react';
import { X, User, Phone, Mail, MapPin, Tag, FileText, Star, Save, AlertCircle } from 'lucide-react';
import { Contact, ContactCategory } from '../types';

interface ContactFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (contactData: Omit<Contact, 'id' | 'created_at'> & { id?: string }) => Promise<void>;
  editingContact: Contact | null;
}

export const ContactFormModal: React.FC<ContactFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingContact,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [category, setCategory] = useState<ContactCategory>('Geral');
  const [isFavorite, setIsFavorite] = useState(false);
  const [notes, setNotes] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (editingContact) {
      setName(editingContact.name || '');
      setPhone(editingContact.phone || '');
      setEmail(editingContact.email || '');
      setAddress(editingContact.address || '');
      setCategory(editingContact.category || 'Geral');
      setIsFavorite(editingContact.is_favorite || false);
      setNotes(editingContact.notes || '');
    } else {
      setName('');
      setPhone('');
      setEmail('');
      setAddress('');
      setCategory('Geral');
      setIsFavorite(false);
      setNotes('');
    }
    setErrorMessage(null);
  }, [editingContact, isOpen]);

  if (!isOpen) return null;

  // Phone input mask / formatter for Brazil standard (XX) XXXXX-XXXX
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);

    if (value.length > 6) {
      value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
    } else if (value.length > 2) {
      value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
    } else if (value.length > 0) {
      value = `(${value}`;
    }
    setPhone(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('O campo Nome é obrigatório.');
      return;
    }

    // Email format validation if filled
    if (email.trim() && !/\S+@\S+\.\S+/.test(email.trim())) {
      setErrorMessage('Por favor, informe um endereço de e-mail válido.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      await onSave({
        id: editingContact?.id,
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim().toLowerCase(),
        address: address.trim(),
        category,
        is_favorite: isFavorite,
        notes: notes.trim(),
      });
      onClose();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Ocorreu um erro ao salvar o contato.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div 
        id="contact-form-modal"
        className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg border border-emerald-200">
              <User className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              {editingContact ? 'Editar Contato' : 'Novo Contato'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Nome */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Nome Completo <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Maria Eduarda Santos"
                className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl pl-9 pr-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all"
              />
            </div>
          </div>

          {/* Telefone & Categoria Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Telefone */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Telefone / WhatsApp
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="(11) 99999-9999"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl pl-9 pr-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all font-mono"
                />
              </div>
            </div>

            {/* Categoria */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Categoria
              </label>
              <div className="relative">
                <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ContactCategory)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl pl-9 pr-3 py-2.5 text-sm text-slate-800 outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="Geral">Geral</option>
                  <option value="Pessoal">Pessoal</option>
                  <option value="Trabalho">Trabalho</option>
                  <option value="Cliente">Cliente</option>
                  <option value="Família">Família</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>
            </div>

          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Endereço de E-mail
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome@empresa.com.br"
                className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl pl-9 pr-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all"
              />
            </div>
          </div>

          {/* Endereço */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Endereço Completo
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Rua, Número, Bairro, Cidade - Estado, CEP"
                className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl pl-9 pr-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all"
              />
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Observações
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Anotações adicionais, cargo ou preferências..."
                className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl pl-9 pr-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all resize-none"
              />
            </div>
          </div>

          {/* Favorito Checkbox */}
          <div className="pt-1">
            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-slate-700 hover:text-slate-900 select-none">
              <input
                type="checkbox"
                checked={isFavorite}
                onChange={(e) => setIsFavorite(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 bg-slate-50 border-slate-300"
              />
              <span className="flex items-center gap-1.5">
                <Star className={`w-3.5 h-3.5 ${isFavorite ? 'text-amber-500 fill-amber-400' : 'text-slate-400'}`} />
                Marcar como favorito
              </span>
            </label>
          </div>

          {/* Footer Submit Buttons */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-200 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Salvando...' : 'Salvar Contato'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
