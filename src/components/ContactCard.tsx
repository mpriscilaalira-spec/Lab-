import React, { useState } from 'react';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Star, 
  Edit3, 
  Trash2, 
  MessageCircle, 
  ExternalLink,
  Copy,
  Check,
  FileText
} from 'lucide-react';
import { Contact } from '../types';

interface ContactCardProps {
  contact: Contact;
  onEdit: (contact: Contact) => void;
  onDelete: (contact: Contact) => void;
  onToggleFavorite: (contact: Contact) => void;
}

export const ContactCard: React.FC<ContactCardProps> = ({
  contact,
  onEdit,
  onDelete,
  onToggleFavorite,
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Category badge colors (Professional Polish light style)
  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'Trabalho':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Cliente':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Pessoal':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Família':
        return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'Outro':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  // Clean numbers for whatsapp link
  const getCleanPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (!cleaned) return '';
    if (cleaned.length === 10 || cleaned.length === 11) {
      return `55${cleaned}`;
    }
    return cleaned;
  };

  const copyToClipboard = (text: string, fieldName: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase() || 'CO';
  };

  const whatsappPhone = getCleanPhone(contact.phone);

  return (
    <div 
      id={`contact-card-${contact.id}`}
      className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-5 flex flex-col justify-between transition-all duration-200 shadow-sm hover:shadow-md group relative"
    >
      <div>
        
        {/* Top Header: Avatar, Name, Favorite & Actions */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-sm tracking-wider shadow-xs">
              {getInitials(contact.name)}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base group-hover:text-emerald-700 transition-colors line-clamp-1">
                {contact.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getCategoryColor(contact.category)}`}>
                  {contact.category || 'Geral'}
                </span>
                {contact.id.startsWith('loc_') && (
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 uppercase" title="Contato salvo em modo local">
                    Local
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Favorite Star Button */}
          <button
            id={`btn-fav-${contact.id}`}
            onClick={() => onToggleFavorite(contact)}
            title={contact.is_favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
              contact.is_favorite
                ? 'bg-amber-50 text-amber-500 border-amber-200'
                : 'text-slate-300 hover:text-slate-500 border-transparent hover:border-slate-200'
            }`}
          >
            <Star className={`w-4 h-4 ${contact.is_favorite ? 'fill-amber-400' : ''}`} />
          </button>
        </div>

        {/* Contact Details List */}
        <div className="space-y-2.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
          
          {/* Phone / Telefone */}
          <div className="flex items-center justify-between group/item">
            <div className="flex items-center gap-2 min-w-0">
              <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="font-mono text-slate-800 font-medium truncate">
                {contact.phone || 'Telefone não informado'}
              </span>
            </div>
            {contact.phone && (
              <div className="flex items-center gap-1 opacity-90 group-hover/item:opacity-100 transition-opacity">
                <a
                  href={`https://wa.me/${whatsappPhone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Abrir no WhatsApp"
                  className="p-1 text-emerald-600 hover:bg-emerald-50 rounded border border-emerald-200 transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                </a>
                <a
                  href={`tel:${contact.phone}`}
                  title="Ligar"
                  className="p-1 text-blue-600 hover:bg-blue-50 rounded border border-blue-200 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                </a>
                <button
                  onClick={() => copyToClipboard(contact.phone, 'phone')}
                  title="Copiar Telefone"
                  className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
                >
                  {copiedField === 'phone' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            )}
          </div>

          {/* Email */}
          <div className="flex items-center justify-between group/item">
            <div className="flex items-center gap-2 min-w-0">
              <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate text-slate-700">
                {contact.email || 'E-mail não informado'}
              </span>
            </div>
            {contact.email && (
              <div className="flex items-center gap-1">
                <a
                  href={`mailto:${contact.email}`}
                  title="Enviar E-mail"
                  className="p-1 text-slate-600 hover:bg-slate-100 rounded border border-slate-200 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  onClick={() => copyToClipboard(contact.email, 'email')}
                  title="Copiar E-mail"
                  className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
                >
                  {copiedField === 'email' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            )}
          </div>

          {/* Endereço / Address */}
          <div className="flex items-start justify-between group/item">
            <div className="flex items-start gap-2 text-slate-600 min-w-0 pr-2">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <span className="text-slate-600 line-clamp-2">
                {contact.address || 'Endereço não informado'}
              </span>
            </div>
            {contact.address && (
              <div className="flex items-center gap-1 shrink-0">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contact.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Abrir no Google Maps"
                  className="p-1 text-rose-600 hover:bg-rose-50 rounded border border-rose-200 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>

          {/* Notes preview */}
          {contact.notes && (
            <div className="flex items-start gap-2 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200/80 mt-2">
              <FileText className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
              <p className="line-clamp-2 italic">{contact.notes}</p>
            </div>
          )}

        </div>

      </div>

      {/* Footer Action Buttons */}
      <div className="flex items-center justify-end gap-2 mt-5 pt-3 border-t border-slate-100">
        <button
          id={`btn-edit-${contact.id}`}
          onClick={() => onEdit(contact)}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors cursor-pointer"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Editar</span>
        </button>

        <button
          id={`btn-delete-${contact.id}`}
          onClick={() => onDelete(contact)}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 transition-colors cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Excluir</span>
        </button>
      </div>

    </div>
  );
};
