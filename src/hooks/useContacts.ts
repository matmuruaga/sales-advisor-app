// src/hooks/useContacts.ts
import { useState, useEffect } from 'react';
import { useSupabase, Database } from './useSupabase';

type Contact = Database['public']['Tables']['contacts']['Row'] & {
  company?: Database['public']['Tables']['companies']['Row'];
  assigned_user?: Database['public']['Tables']['users']['Row'];
};

type ContactFilters = {
  status?: 'hot' | 'warm' | 'cold';
  assignedUserId?: string;
  companyId?: string;
  search?: string;
  tags?: string[];
};

export const useContacts = (filters?: ContactFilters) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = useSupabase();

  const fetchContacts = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('contacts')
        .select(`
          *,
          company:companies(*),
          assigned_user:users(*)
        `);

      // Apply filters
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      
      if (filters?.assignedUserId) {
        query = query.eq('assigned_user_id', filters.assignedUserId);
      }
      
      if (filters?.companyId) {
        query = query.eq('company_id', filters.companyId);
      }
      
      if (filters?.search) {
        query = query.or(`full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,role_title.ilike.%${filters.search}%`);
      }
      
      if (filters?.tags && filters.tags.length > 0) {
        query = query.overlaps('tags', filters.tags);
      }

      // Order by score desc, then by last activity
      query = query.order('score', { ascending: false })
                   .order('last_activity_at', { ascending: false, nullsFirst: false });

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      setContacts(data || []);
    } catch (err) {
      console.error('Error fetching contacts:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch contacts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [filters?.status, filters?.assignedUserId, filters?.companyId, filters?.search, JSON.stringify(filters?.tags)]);

  const updateContact = async (contactId: string, updates: Partial<Database['public']['Tables']['contacts']['Update']>) => {
    try {
      const { error } = await supabase
        .from('contacts')
        .update(updates)
        .eq('id', contactId);

      if (error) throw error;

      // Refresh contacts
      await fetchContacts();
      
      return { success: true };
    } catch (err) {
      console.error('Error updating contact:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Failed to update contact' };
    }
  };

  const createContact = async (contact: Database['public']['Tables']['contacts']['Insert']) => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .insert(contact)
        .select()
        .single();

      if (error) throw error;

      // Refresh contacts
      await fetchContacts();
      
      return { success: true, data };
    } catch (err) {
      console.error('Error creating contact:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Failed to create contact' };
    }
  };

  const deleteContact = async (contactId: string) => {
    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', contactId);

      if (error) throw error;

      // Refresh contacts
      await fetchContacts();
      
      return { success: true };
    } catch (err) {
      console.error('Error deleting contact:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Failed to delete contact' };
    }
  };

  // Real-time subscription for contacts
  useEffect(() => {
    const subscription = supabase
      .channel('contacts_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'contacts' },
        (payload) => {
          console.log('Contact change received:', payload);
          fetchContacts(); // Refresh on any change
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    contacts,
    loading,
    error,
    refetch: fetchContacts,
    updateContact,
    createContact,
    deleteContact,
  };
};

// Hook for getting a single contact
export const useContact = (contactId: string) => {
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = useSupabase();

  useEffect(() => {
    if (!contactId) return;

    const fetchContact = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('contacts')
          .select(`
            *,
            company:companies(*),
            assigned_user:users(*)
          `)
          .eq('id', contactId)
          .single();

        if (error) throw error;

        setContact(data);
      } catch (err) {
        console.error('Error fetching contact:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch contact');
      } finally {
        setLoading(false);
      }
    };

    fetchContact();
  }, [contactId]);

  return { contact, loading, error };
};

// Utility hook for contact statistics
export const useContactStats = () => {
  const [stats, setStats] = useState<{
    total: number;
    hot: number;
    warm: number;
    cold: number;
    avgScore: number;
    totalPipelineValue: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = useSupabase();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);

        const { data, error } = await supabase
          .from('contacts')
          .select('status, score, deal_value');

        if (error) throw error;

        const total = data.length;
        const hot = data.filter(c => c.status === 'hot').length;
        const warm = data.filter(c => c.status === 'warm').length;
        const cold = data.filter(c => c.status === 'cold').length;
        const avgScore = data.reduce((sum, c) => sum + c.score, 0) / total;
        const totalPipelineValue = data.reduce((sum, c) => sum + (c.deal_value || 0), 0);

        setStats({ total, hot, warm, cold, avgScore, totalPipelineValue });
      } catch (err) {
        console.error('Error fetching contact stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading };
};