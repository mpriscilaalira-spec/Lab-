import React from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';
import { Contact } from '../types';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  contact: Contact | null;
  onClose: () => void;
  onConfirm: (contactId: string) => Promise<void>;
  isDeleting: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  contact,
  onClose,
  onConfirm,
  isDeleting,
}) => {
  if (!isOpen || !contact) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div 
        id="delete-confirm-modal"
        className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-xl overflow-hidden p-6 space-y-4"
      >
        <div className="flex items-start justify-between">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl border border-rose-200">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>
          <h3 className="text-base font-bold text-slate-900">Excluir Contato</h3>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            Tem certeza de que deseja remover <strong className="text-slate-900 font-bold">{contact.name}</strong>? Esta ação não poderá ser desfeita.
          </p>
        </div>

        <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-200">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-200 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={() => onConfirm(contact.id)}
            disabled={isDeleting}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>{isDeleting ? 'Excluindo...' : 'Sim, Excluir'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
