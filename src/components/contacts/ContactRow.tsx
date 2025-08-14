import { Star, MoreHorizontal, TrendingUp, TrendingDown, Minus } from 'lucide-react';
// MIGRADO A SUPABASE: Usamos tipos de Supabase en lugar de mockContacts
import { type Contact } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// Configuración de status movida aquí para no depender de mockContacts
const statusConfig = {
  hot: { color: 'bg-red-100 text-red-800 border-red-200', icon: TrendingUp, label: 'Hot' },
  warm: { color: 'bg-orange-100 text-orange-800 border-orange-200', icon: Minus, label: 'Warm' },
  cold: { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: TrendingDown, label: 'Cold' }
};

interface ContactRowProps {
  contact: Contact;
  onContactSelect: (contactId: string) => void;
  onCompanySelect: (companyName: string) => void;
}

export const ContactRow = ({ contact, onContactSelect, onCompanySelect }: ContactRowProps) => {
  const statusInfo = statusConfig[contact.status as keyof typeof statusConfig];
  
  // Formatear el valor del deal con manejo de null/undefined
  const formatDealValue = (value?: number | null) => {
    if (!value) return '€0';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Formatear fecha de última actividad
  const formatLastActivity = (date?: string | null) => {
    if (!date) return 'No activity';
    const now = new Date();
    const activityDate = new Date(date);
    const diffMs = now.getTime() - activityDate.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 30) return `${diffDays}d ago`;
    return activityDate.toLocaleDateString();
  };

  return (
    <div className="grid grid-cols-12 gap-4 items-center p-3 rounded-lg hover:bg-gray-50 transition-colors border-b">
      {/* Contact */}
      <div className="col-span-3 flex items-center space-x-3">
        {contact.avatar_url ? (
          <img src={contact.avatar_url} alt={contact.full_name} className="w-9 h-9 rounded-full object-cover" />
        ) : (
          <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center">
            <span className="text-purple-600 font-semibold text-sm">
              {contact.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </span>
          </div>
        )}
        <div>
          <p 
            className="font-semibold text-sm text-gray-800 truncate cursor-pointer hover:text-purple-600"
            onClick={(e) => { e.stopPropagation(); onContactSelect(contact.id); }}
          >
            {contact.full_name}
          </p>
          <p className="text-xs text-gray-500 truncate">{contact.role_title || 'No role'}</p>
        </div>
      </div>

      {/* Company */}
      <div className="col-span-2">
        <p 
            className="text-sm text-gray-800 truncate cursor-pointer hover:text-purple-600"
            onClick={(e) => { 
              e.stopPropagation(); 
              // Usar company name si está disponible
              onCompanySelect(contact.company?.name || 'unknown');
            }}
        >
            {contact.company?.name || 'No company'}
        </p>
        <p className="text-xs text-gray-500 truncate">{contact.location || 'No location'}</p>
      </div>

      {/* Status & Score */}
      <div className="col-span-2 flex items-center space-x-2">
        <Badge className={`${statusInfo.color} text-xxs`}>{statusInfo.label}</Badge>
        <div className="flex items-center">
            <Star className="w-3.5 h-3.5 mr-1 text-yellow-400 fill-current" />
            <span className="font-semibold text-sm text-gray-700">{contact.score || 0}</span>
        </div>
      </div>
      
      {/* Deal Value */}
      <div className="col-span-2">
        <p className="font-semibold text-sm text-gray-800">{formatDealValue(contact.deal_value)}</p>
        <p className="text-xs text-purple-600">{contact.probability || 0}% probability</p>
      </div>

      {/* Last Activity */}
      <div className="col-span-2">
        <p className="text-sm text-gray-800 truncate">
          {formatLastActivity(contact.last_activity_at)}
        </p>
        <p className="text-xs text-gray-500">
          {contact.next_action_description || 'No action scheduled'}
        </p>
      </div>

      {/* Actions */}
      <div className="col-span-1 flex justify-end">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={(e) => { e.stopPropagation(); onContactSelect(contact.id); }}
          className="rounded-full h-8 w-8"
        >
          <MoreHorizontal className="w-4 h-4 text-gray-500" />
        </Button>
      </div>
    </div>
  );
};