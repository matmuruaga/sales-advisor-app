"use client";

import { useState, useMemo } from 'react';
// MIGRADO A SUPABASE: Ya no usamos datos hardcodeados
// import { enhancedMockContacts as mockContacts } from '@/data/enhancedMockContacts';
import { useSupabaseContacts } from '@/hooks/useSupabaseContacts';
import { ContactRow } from './contacts/ContactRow';
import { LoadingSpinner } from './common/LoadingSpinner';
import { ErrorMessage } from './common/ErrorMessage';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus, Filter, RefreshCw } from 'lucide-react';

// 1. Añadimos las nuevas props que recibirá desde page.tsx
interface ContactsPageProps {
  onContactSelect: (contactId: string) => void;
  onCompanySelect: (companyName: string) => void;
}

export const ContactsPage = ({ onContactSelect, onCompanySelect }: ContactsPageProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'hot' | 'warm' | 'cold'>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Usar el hook de Supabase con filtros
  const { 
    contacts, 
    loading, 
    error, 
    refetch,
    createContact 
  } = useSupabaseContacts({
    status: statusFilter !== 'all' ? statusFilter : undefined,
    search: searchTerm
  });

  // Contar contactos por status
  const statusCounts = useMemo(() => {
    return {
      hot: contacts.filter(c => c.status === 'hot').length,
      warm: contacts.filter(c => c.status === 'warm').length,
      cold: contacts.filter(c => c.status === 'cold').length,
      total: contacts.length
    };
  }, [contacts]);

  // Mostrar loading state
  if (loading && contacts.length === 0) {
    return <LoadingSpinner message="Loading contacts from Supabase..." />;
  }

  // Mostrar error state
  if (error && contacts.length === 0) {
    return <ErrorMessage message={error} onRetry={refetch} />;
  }

  return (
    <div className="h-full w-full flex flex-col">
      {/* Header con contador actualizado */}
      <div className="flex-shrink-0 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Contacts</h1>
            <p className="text-sm text-gray-500">
              {statusCounts.total} contacts found
              {statusFilter !== 'all' && ` (filtered by ${statusFilter})`}
            </p>
          </div>
          <Button 
            size="sm" 
            variant="outline"
            onClick={refetch}
            className="ml-4"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Toolbar con filtros mejorados */}
      <div className="flex-shrink-0 space-y-3 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
              <Input 
                placeholder="Search contacts..." 
                className="pl-9 h-9 text-sm"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 mr-2"/>
              Filters
              {statusFilter !== 'all' && (
                <span className="ml-2 px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">
                  1
                </span>
              )}
            </Button>
          </div>
          <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
            <Plus className="w-4 h-4 mr-2"/>
            Add Contact
          </Button>
        </div>

        {/* Filtros de status */}
        {showFilters && (
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium text-gray-700">Status:</span>
            <div className="flex gap-2">
              {(['all', 'hot', 'warm', 'cold'] as const).map(status => (
                <Button
                  key={status}
                  size="sm"
                  variant={statusFilter === status ? 'default' : 'outline'}
                  onClick={() => setStatusFilter(status)}
                  className={statusFilter === status ? 'bg-purple-600' : ''}
                >
                  {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                  {status !== 'all' && (
                    <span className="ml-1.5 text-xs">
                      ({statusCounts[status]})
                    </span>
                  )}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
        
        <div className="flex-shrink-0 grid grid-cols-12 gap-4 px-3 py-2 text-xs font-semibold text-gray-500 border-b">
            <div className="col-span-3">Contact</div>
            <div className="col-span-2">Company</div>
            <div className="col-span-2">Status & Score</div>
            <div className="col-span-2">Deal Value</div>
            <div className="col-span-2">Last Activity</div>
            <div className="col-span-1 text-right">Actions</div>
        </div>
        
      {/* Lista de contactos con estados de loading/empty */}
      <div className="flex-1 overflow-y-auto">
        {loading && contacts.length > 0 && (
          <div className="absolute top-0 left-0 right-0 bg-white/80 backdrop-blur-sm z-10 p-2">
            <div className="text-center text-sm text-gray-600">
              Updating contacts...
            </div>
          </div>
        )}
        
        {contacts.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center h-64">
            <p className="text-gray-500 mb-4">
              {searchTerm || statusFilter !== 'all' 
                ? 'No contacts found matching your filters'
                : 'No contacts yet'}
            </p>
            {(searchTerm || statusFilter !== 'all') && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        )}
        
        <div className="flex flex-col">
          {contacts.map(contact => (
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