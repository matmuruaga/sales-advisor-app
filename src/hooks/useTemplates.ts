// src/hooks/useTemplates.ts
import { useState, useEffect } from 'react';
import { useSupabase, Database } from './useSupabase';

type PromptTemplate = Database['public']['Tables']['prompt_templates']['Row'];
type QuickActionTemplate = Database['public']['Tables']['quick_action_templates']['Row'];

export const usePromptTemplates = (category?: string) => {
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = useSupabase();

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('prompt_templates')
        .select('*')
        .eq('is_active', true);

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query
        .order('usage_count', { ascending: false })
        .order('title');

      if (error) throw error;

      setTemplates(data || []);
    } catch (err) {
      console.error('Error fetching prompt templates:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch prompt templates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [category]);

  const createTemplate = async (template: Database['public']['Tables']['prompt_templates']['Insert']) => {
    try {
      const { data, error } = await supabase
        .from('prompt_templates')
        .insert(template)
        .select()
        .single();

      if (error) throw error;

      await fetchTemplates();
      return { success: true, data };
    } catch (err) {
      console.error('Error creating template:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Failed to create template' };
    }
  };

  const updateTemplate = async (templateId: string, updates: Partial<Database['public']['Tables']['prompt_templates']['Update']>) => {
    try {
      const { error } = await supabase
        .from('prompt_templates')
        .update(updates)
        .eq('id', templateId);

      if (error) throw error;

      await fetchTemplates();
      return { success: true };
    } catch (err) {
      console.error('Error updating template:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Failed to update template' };
    }
  };

  const deleteTemplate = async (templateId: string) => {
    try {
      const { error } = await supabase
        .from('prompt_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;

      await fetchTemplates();
      return { success: true };
    } catch (err) {
      console.error('Error deleting template:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Failed to delete template' };
    }
  };

  const incrementUsage = async (templateId: string) => {
    try {
      const { error } = await supabase.rpc('increment_template_usage', {
        template_id: templateId
      });

      if (error) throw error;

      return { success: true };
    } catch (err) {
      console.error('Error incrementing template usage:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Failed to increment usage' };
    }
  };

  return {
    templates,
    loading,
    error,
    refetch: fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    incrementUsage,
  };
};

export const useQuickActionTemplates = (actionType?: 'schedule' | 'call' | 'simulate' | 'nested') => {
  const [templates, setTemplates] = useState<QuickActionTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = useSupabase();

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('quick_action_templates')
        .select('*')
        .eq('is_active', true);

      if (actionType) {
        query = query.eq('action_type', actionType);
      }

      const { data, error } = await query
        .order('usage_count', { ascending: false })
        .order('title');

      if (error) throw error;

      setTemplates(data || []);
    } catch (err) {
      console.error('Error fetching quick action templates:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch quick action templates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [actionType]);

  const createQuickTemplate = async (template: Database['public']['Tables']['quick_action_templates']['Insert']) => {
    try {
      const { data, error } = await supabase
        .from('quick_action_templates')
        .insert(template)
        .select()
        .single();

      if (error) throw error;

      await fetchTemplates();
      return { success: true, data };
    } catch (err) {
      console.error('Error creating quick template:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Failed to create quick template' };
    }
  };

  const incrementQuickTemplateUsage = async (templateId: string) => {
    try {
      const { error } = await supabase.rpc('increment_quick_template_usage', {
        template_id: templateId
      });

      if (error) throw error;

      return { success: true };
    } catch (err) {
      console.error('Error incrementing quick template usage:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Failed to increment usage' };
    }
  };

  // Search templates based on recognition patterns
  const searchTemplates = (query: string) => {
    const lowerQuery = query.toLowerCase();
    
    return templates.filter(template => {
      // Check title and prompt text
      const titleMatch = template.title.toLowerCase().includes(lowerQuery);
      const promptMatch = template.prompt_text.toLowerCase().includes(lowerQuery);
      
      // Check recognition patterns if they exist
      const patterns = template.recognition_patterns as any;
      let patternMatch = false;
      
      if (patterns && typeof patterns === 'object') {
        // Search in various pattern arrays
        const searchInPatterns = (patternArray: string[]) => {
          return patternArray?.some(pattern => 
            pattern.toLowerCase().includes(lowerQuery) || 
            lowerQuery.includes(pattern.toLowerCase())
          );
        };

        patternMatch = searchInPatterns(patterns.names) ||
                      searchInPatterns(patterns.companies) ||
                      searchInPatterns(patterns.roles) ||
                      searchInPatterns(patterns.painPointKeywords);
      }
      
      return titleMatch || promptMatch || patternMatch;
    });
  };

  return {
    templates,
    loading,
    error,
    refetch: fetchTemplates,
    createQuickTemplate,
    incrementQuickTemplateUsage,
    searchTemplates,
  };
};

// Hook for template statistics and recommendations
export const useTemplateStats = () => {
  const [stats, setStats] = useState<{
    totalTemplates: number;
    mostUsedTemplates: Array<{ title: string; usage_count: number; type: string }>;
    recentTemplates: Array<{ title: string; created_at: string; type: string }>;
    categoriesBreakdown: Record<string, number>;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = useSupabase();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);

        // Fetch prompt templates stats
        const { data: promptTemplates, error: promptError } = await supabase
          .from('prompt_templates')
          .select('title, usage_count, category, created_at')
          .eq('is_active', true);

        if (promptError) throw promptError;

        // Fetch quick action templates stats
        const { data: quickTemplates, error: quickError } = await supabase
          .from('quick_action_templates')
          .select('title, usage_count, action_type, created_at')
          .eq('is_active', true);

        if (quickError) throw quickError;

        // Combine and analyze data
        const allTemplates = [
          ...promptTemplates.map(t => ({ ...t, type: 'prompt', category: t.category || 'general' })),
          ...quickTemplates.map(t => ({ ...t, type: 'quick', category: t.action_type }))
        ];

        const totalTemplates = allTemplates.length;

        const mostUsedTemplates = allTemplates
          .sort((a, b) => b.usage_count - a.usage_count)
          .slice(0, 10)
          .map(t => ({ title: t.title, usage_count: t.usage_count, type: t.type }));

        const recentTemplates = allTemplates
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 10)
          .map(t => ({ title: t.title, created_at: t.created_at, type: t.type }));

        const categoriesBreakdown: Record<string, number> = {};
        allTemplates.forEach(t => {
          categoriesBreakdown[t.category] = (categoriesBreakdown[t.category] || 0) + 1;
        });

        setStats({
          totalTemplates,
          mostUsedTemplates,
          recentTemplates,
          categoriesBreakdown,
        });
      } catch (err) {
        console.error('Error fetching template stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading };
};