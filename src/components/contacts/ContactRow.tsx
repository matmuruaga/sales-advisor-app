import { Star, MoreHorizontal } from 'lucide-react';
import { statusConfig, type Contact } from '@/data/mockContacts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ContactRowProps {
  contact: Contact;
  // 1. Cambiamos las props para manejar los nuevos eventos
  onContactSelect: (contactId: string) => void;
  onCompanySelect: (companyName: string) => void;
}

export const ContactRow = ({ contact, onContactSelect, onCompanySelect }: ContactRowProps) => {
  const statusInfo = statusConfig[contact.status as keyof typeof statusConfig];
  const dealValueInEuros = contact.value.replace('$', '€');

  return (
    // 2. El div principal ya no tiene un onClick global
    <div className="grid grid-cols-12 gap-4 items-center p-3 rounded-lg hover:bg-gray-50 transition-colors border-b">
      {/* Contact */}
      <div className="col-span-3 flex items-center space-x-3">
        <img src={contact.avatar} alt={contact.name} className="w-9 h-9 rounded-full object-cover" />
        <div>
          {/* 3. El onClick ahora está en el nombre */}
          <p 
            className="font-semibold text-sm text-gray-800 truncate cursor-pointer"
            onClick={(e) => { e.stopPropagation(); onContactSelect(contact.id); }}
          >
            {contact.name}
          </p>
          <p className="text-xs text-gray-500 truncate">{contact.role}</p>
        </div>
      </div>

      {/* Company */}
      <div className="col-span-2">
        {/* 4. El onClick ahora está en la compañía */}
        <p 
            className="text-sm text-gray-800 truncate cursor-pointer"
            onClick={(e) => { e.stopPropagation(); onCompanySelect(contact.company); }}
        >
            {contact.company}
        </p>
        <p className="text-xs text-gray-500 truncate">{contact.location}</p>
      </div>


      {/* Status & Score */}
      <div className="col-span-2 flex items-center space-x-2">
        <Badge className={`${statusInfo.color} text-xxs`}>{statusInfo.label}</Badge>
        <div className="flex items-center">
            <Star className="w-3.5 h-3.5 mr-1 text-yellow-400 fill-current" />
            <span className="font-semibold text-sm text-gray-700">{contact.score}</span>
        </div>
      </div>
      
      {/* Deal Value */}
      <div className="col-span-2">
        <p className="font-semibold text-sm text-gray-800">{dealValueInEuros}</p>
        <p className="text-xs text-purple-600">{contact.probability}% probability</p>
      </div>

      {/* Last Activity */}
      <div className="col-span-2">
        <p className="text-sm text-gray-800 truncate">{contact.lastContact}</p>
        <p className="text-xs text-gray-500">{contact.lastActivity}</p>
      </div>

      {/* Actions */}
      <div className="col-span-1 flex justify-end">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={(e) => { e.stopPropagation(); onContactSelect(contact.id); }} // El botón también abre el panel de contacto
          className="rounded-full h-8 w-8"
        >
          <MoreHorizontal className="w-4 h-4 text-gray-500" />
        </Button>
      </div>
    </div>
  );
};