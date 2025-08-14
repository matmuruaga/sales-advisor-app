import { useState, useEffect, useCallback } from 'react'
import { supabase, type Action, type ActionTemplate, type ActionAnalytics, type ActionSummary, type ActionWithRelations } from '@/lib/supabase'
import { useSupabase } from './useSupabase'

interface UseSupabaseActionsOptions {
  includeAnalytics?: boolean
  includeRelations?: boolean
  realTimeUpdates?: boolean
}

interface ActionFilters {
  status?: Action['status'] | Action['status'][]
  type?: Action['type'] | Action['type'][]
  priority?: Action['priority'] | Action['priority'][]
  user_id?: string
  contact_id?: string
  company_id?: string
  ai_generated?: boolean
  due_date_from?: string
  due_date_to?: string
  tags?: string[]
  search?: string
}

interface CreateActionData {
  type: Action['type']
  title: string
  description?: string
  contact_id?: string
  company_id?: string
  priority?: Action['priority']
  due_date?: string
  scheduled_at?: string
  content?: any
  metadata?: any
  estimated_duration_minutes?: number
  success_probability?: number
  tags?: string[]
  category?: string
  ai_generated?: boolean
  prompt_used?: string
  ai_confidence_score?: number
}

interface UpdateActionData {
  status?: Action['status']
  title?: string
  description?: string
  priority?: Action['priority']
  due_date?: string
  scheduled_at?: string
  completed_at?: string
  content?: any
  metadata?: any
  actual_duration_minutes?: number
  tags?: string[]
  category?: string
}

export function useSupabaseActions(options: UseSupabaseActionsOptions = {}) {
  const { user, organization } = useSupabase()
  const [actions, setActions] = useState<ActionWithRelations[]>([])
  const [templates, setTemplates] = useState<ActionTemplate[]>([])
  const [summary, setSummary] = useState<ActionSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { includeAnalytics = false, includeRelations = true, realTimeUpdates = true } = options

  // Construir query base para acciones
  const buildActionsQuery = useCallback((filters?: ActionFilters) => {
    let query = supabase
      .from('actions')
      .select(
        includeRelations
          ? `
            *,
            user:users(*),
            contact:contacts(*),
            company:companies(*),
            ${includeAnalytics ? 'analytics:action_analytics(*)' : ''}
          `
          : '*'
      )
      .order('created_at', { ascending: false })

    // Aplicar filtros
    if (filters) {
      if (filters.status) {
        if (Array.isArray(filters.status)) {
          query = query.in('status', filters.status)
        } else {
          query = query.eq('status', filters.status)
        }
      }

      if (filters.type) {
        if (Array.isArray(filters.type)) {
          query = query.in('type', filters.type)
        } else {
          query = query.eq('type', filters.type)
        }
      }

      if (filters.priority) {
        if (Array.isArray(filters.priority)) {
          query = query.in('priority', filters.priority)
        } else {
          query = query.eq('priority', filters.priority)
        }
      }

      if (filters.user_id) {
        query = query.eq('user_id', filters.user_id)
      }

      if (filters.contact_id) {
        query = query.eq('contact_id', filters.contact_id)
      }

      if (filters.company_id) {
        query = query.eq('company_id', filters.company_id)
      }

      if (filters.ai_generated !== undefined) {
        query = query.eq('ai_generated', filters.ai_generated)
      }

      if (filters.due_date_from) {
        query = query.gte('due_date', filters.due_date_from)
      }

      if (filters.due_date_to) {
        query = query.lte('due_date', filters.due_date_to)
      }

      if (filters.tags && filters.tags.length > 0) {
        query = query.overlaps('tags', filters.tags)
      }

      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
      }
    }

    return query
  }, [includeRelations, includeAnalytics])

  // Cargar acciones
  const loadActions = useCallback(async (filters?: ActionFilters) => {
    if (!organization?.id) return

    try {
      setLoading(true)
      setError(null)

      const { data, error: queryError } = await buildActionsQuery(filters)

      if (queryError) throw queryError

      setActions(data || [])
    } catch (err) {
      console.error('Error loading actions:', err)
      setError(err instanceof Error ? err.message : 'Error loading actions')
    } finally {
      setLoading(false)
    }
  }, [organization?.id, buildActionsQuery])

  // Cargar templates
  const loadTemplates = useCallback(async (type?: Action['type']) => {
    if (!organization?.id) return

    try {
      let query = supabase
        .from('action_templates')
        .select('*')
        .or(`organization_id.eq.${organization.id},is_global.eq.true`)
        .eq('is_active', true)
        .order('usage_count', { ascending: false })

      if (type) {
        query = query.eq('type', type)
      }

      const { data, error: queryError } = await query

      if (queryError) throw queryError

      setTemplates(data || [])
    } catch (err) {
      console.error('Error loading templates:', err)
      setError(err instanceof Error ? err.message : 'Error loading templates')
    }
  }, [organization?.id])

  // Cargar resumen de acciones
  const loadSummary = useCallback(async () => {
    if (!organization?.id) return

    try {
      const { data, error: queryError } = await supabase
        .rpc('get_actions_summary', { org_id: organization.id })

      if (queryError) throw queryError

      setSummary(data)
    } catch (err) {
      console.error('Error loading actions summary:', err)
    }
  }, [organization?.id])

  // Crear acción
  const createAction = useCallback(async (actionData: CreateActionData): Promise<Action | null> => {
    if (!user?.id || !organization?.id) {
      throw new Error('User or organization not found')
    }

    try {
      setError(null)

      const { data, error: insertError } = await supabase
        .from('actions')
        .insert({
          organization_id: organization.id,
          user_id: user.id,
          ...actionData
        })
        .select()
        .single()

      if (insertError) throw insertError

      // Recargar acciones
      await loadActions()
      await loadSummary()

      return data
    } catch (err) {
      console.error('Error creating action:', err)
      setError(err instanceof Error ? err.message : 'Error creating action')
      throw err
    }
  }, [user?.id, organization?.id, loadActions, loadSummary])

  // Actualizar acción
  const updateAction = useCallback(async (actionId: string, updates: UpdateActionData): Promise<Action | null> => {
    try {
      setError(null)

      // Si se está marcando como completada, agregar timestamp
      if (updates.status === 'completed' && !updates.completed_at) {
        updates.completed_at = new Date().toISOString()
      }

      const { data, error: updateError } = await supabase
        .from('actions')
        .update(updates)
        .eq('id', actionId)
        .select()
        .single()

      if (updateError) throw updateError

      // Actualizar estado local
      setActions(prev => prev.map(action => 
        action.id === actionId ? { ...action, ...updates } : action
      ))

      await loadSummary()

      return data
    } catch (err) {
      console.error('Error updating action:', err)
      setError(err instanceof Error ? err.message : 'Error updating action')
      throw err
    }
  }, [loadSummary])

  // Eliminar acción
  const deleteAction = useCallback(async (actionId: string): Promise<void> => {
    try {
      setError(null)

      const { error: deleteError } = await supabase
        .from('actions')
        .delete()
        .eq('id', actionId)

      if (deleteError) throw deleteError

      // Actualizar estado local
      setActions(prev => prev.filter(action => action.id !== actionId))
      await loadSummary()
    } catch (err) {
      console.error('Error deleting action:', err)
      setError(err instanceof Error ? err.message : 'Error deleting action')
      throw err
    }
  }, [loadSummary])

  // Crear acción desde template
  const createActionFromTemplate = useCallback(async (
    templateId: string, 
    variables: Record<string, string> = {},
    overrides: Partial<CreateActionData> = {}
  ): Promise<Action | null> => {
    try {
      setError(null)

      // Obtener template
      const { data: template, error: templateError } = await supabase
        .from('action_templates')
        .select('*')
        .eq('id', templateId)
        .single()

      if (templateError) throw templateError

      // Procesar contenido del template con variables
      let processedContent = { ...template.template_content }
      
      // Reemplazar variables en el contenido
      const replaceVariables = (obj: any): any => {
        if (typeof obj === 'string') {
          let result = obj
          Object.entries(variables).forEach(([key, value]) => {
            result = result.replace(new RegExp(`{{${key}}}`, 'g'), value)
          })
          return result
        } else if (Array.isArray(obj)) {
          return obj.map(replaceVariables)
        } else if (obj && typeof obj === 'object') {
          const newObj: any = {}
          Object.entries(obj).forEach(([key, value]) => {
            newObj[key] = replaceVariables(value)
          })
          return newObj
        }
        return obj
      }

      processedContent = replaceVariables(processedContent)

      // Crear acción basada en template
      const actionData: CreateActionData = {
        type: template.type,
        title: overrides.title || `${template.name} - ${variables.contact_name || variables.company_name || 'New Action'}`,
        description: overrides.description || template.description,
        content: processedContent,
        category: template.category,
        tags: [...(template.tags || []), ...(overrides.tags || [])],
        estimated_duration_minutes: template.avg_completion_time,
        ai_generated: true,
        prompt_used: `Used template: ${template.name}`,
        ...overrides
      }

      const newAction = await createAction(actionData)

      // Incrementar usage_count del template
      await supabase
        .from('action_templates')
        .update({ usage_count: template.usage_count + 1 })
        .eq('id', templateId)

      return newAction
    } catch (err) {
      console.error('Error creating action from template:', err)
      setError(err instanceof Error ? err.message : 'Error creating action from template')
      throw err
    }
  }, [createAction])

  // Generar acción desde prompt usando Claude API
  const generateActionFromPrompt = useCallback(async (
    prompt: string,
    context: {
      contact_id?: string
      company_id?: string
      type?: Action['type']
      mentions?: Array<{id: string, type: 'contact' | 'user', name: string, email?: string, company?: string}>
    } = {}
  ): Promise<Action | null> => {
    try {
      setError(null)

      // Llamar al endpoint de Claude API
      const response = await fetch('/api/generate-action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userPrompt: prompt,
          userId: user?.id || 'temp-user-id',
          mentions: context.mentions || [],
          contacts: [], // Se obtienen en el endpoint desde Supabase
          templates: templates.map(t => t.name)
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate action with AI');
      }

      const result = await response.json();

      if (result.success && result.action) {
        // La acción ya fue creada en el endpoint, solo necesitamos recargar la lista
        await loadActions();
        await loadSummary();
        
        // Buscar la acción recién creada
        const createdAction = actions.find(a => a.id === result.action.id);
        return createdAction || result.action;
      }

      throw new Error('No action was generated');
    } catch (err) {
      console.error('Error generating action from prompt:', err)
      setError(err instanceof Error ? err.message : 'Error generating action from prompt')
      throw err
    }
  }, [user?.id, templates, loadActions, loadSummary, actions])

  // Configurar real-time subscriptions
  useEffect(() => {
    if (!realTimeUpdates || !organization?.id) return

    const subscription = supabase
      .channel('actions_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'actions',
          filter: `organization_id=eq.${organization.id}`
        },
        (payload) => {
          console.log('Action change:', payload)
          
          if (payload.eventType === 'INSERT') {
            // Recargar para obtener relaciones
            loadActions()
          } else if (payload.eventType === 'UPDATE') {
            setActions(prev => prev.map(action => 
              action.id === payload.new.id 
                ? { ...action, ...payload.new }
                : action
            ))
          } else if (payload.eventType === 'DELETE') {
            setActions(prev => prev.filter(action => action.id !== payload.old.id))
          }

          // Actualizar resumen
          loadSummary()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [realTimeUpdates, organization?.id, loadActions, loadSummary])

  // Cargar datos iniciales
  useEffect(() => {
    if (organization?.id) {
      loadActions()
      loadTemplates()
      loadSummary()
    }
  }, [organization?.id, loadActions, loadTemplates, loadSummary])

  return {
    // State
    actions,
    templates,
    summary,
    loading,
    error,

    // Actions
    loadActions,
    loadTemplates,
    loadSummary,
    createAction,
    updateAction,
    deleteAction,
    createActionFromTemplate,
    generateActionFromPrompt,

    // Utilities
    refetch: () => {
      loadActions()
      loadTemplates()
      loadSummary()
    }
  }
}

// Hook especializado para métricas de acciones
export function useActionMetrics() {
  const { summary, actions } = useSupabaseActions()

  const getMetricsByPeriod = useCallback((days: number = 30) => {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)

    const recentActions = actions.filter(action => 
      new Date(action.created_at) >= cutoffDate
    )

    const completedActions = recentActions.filter(action => action.status === 'completed')
    const successRate = recentActions.length > 0 
      ? (completedActions.length / recentActions.length) * 100 
      : 0

    const avgCompletionTime = completedActions
      .filter(action => action.actual_duration_minutes)
      .reduce((acc, action) => acc + (action.actual_duration_minutes || 0), 0) / completedActions.length || 0

    return {
      total: recentActions.length,
      completed: completedActions.length,
      success_rate: successRate,
      avg_completion_time: avgCompletionTime,
      by_type: recentActions.reduce((acc, action) => {
        acc[action.type] = (acc[action.type] || 0) + 1
        return acc
      }, {} as Record<Action['type'], number>),
      by_priority: recentActions.reduce((acc, action) => {
        acc[action.priority] = (acc[action.priority] || 0) + 1
        return acc
      }, {} as Record<Action['priority'], number>)
    }
  }, [actions])

  return {
    summary,
    getMetricsByPeriod
  }
}