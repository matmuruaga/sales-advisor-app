"use client";

import { useState } from 'react';
import { mockContacts } from '@/data/mockContacts';
import { ContactRow } from './contacts/ContactRow';
// Ya no importamos el Modal ni los Paneles aquí

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus } from 'lucide-react';

// 1. Añadimos las nuevas props que recibirá desde page.tsx
interface ContactsPageProps {
  onContactSelect: (contactId: string) => void;
  onCompanySelect: (companyName: string) => void;
}

export const ContactsPage = ({ onContactSelect, onCompanySelect }: ContactsPageProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  // 2. Ya no necesitamos el estado para el contacto seleccionado aquí
  // const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  const filteredContacts = (mockContacts || []).filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    // 3. El div principal ya no necesita ser 'relative'
    <div className="h-full w-full flex flex-col">
      {/* Header, Toolbar y Cabecera de la lista (sin cambios) */}
      <div className="flex-shrink-0 mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Contacts</h1>
        <p className="text-sm text-gray-500">{filteredContacts.length} contacts found.</p>
      </div>

        <div className="flex-shrink-0 flex items-center justify-between mb-4">
            <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
            <Input 
                placeholder="Search contacts..." 
                className="pl-9 h-9 text-sm"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
            />
            </div>
            <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                <Plus className="w-4 h-4 mr-2"/>
                Add Contact
            </Button>
        </div>
        
        <div className="flex-shrink-0 grid grid-cols-12 gap-4 px-3 py-2 text-xs font-semibold text-gray-500 border-b">
            <div className="col-span-3">Contact</div>
            <div className="col-span-2">Company</div>
            <div className="col-span-2">Status & Score</div>
            <div className="col-span-2">Deal Value</div>
            <div className="col-span-2">Last Activity</div>
            <div className="col-span-1 text-right">Actions</div>
        </div>
        
       <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col">
          {filteredContacts.map(contact => (
            <ContactRow 
              key={contact.id} 
              contact={contact} 
              onContactSelect={onContactSelect}
              onCompanySelect={onCompanySelect}
            />
          ))}
        </div>
      </div>
    </div>
  );
};