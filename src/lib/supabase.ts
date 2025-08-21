import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Environment variables with proper error handling
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.'
  )
}

// Get app URL for production/development
const getAppUrl = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'
}

// Create Supabase client with enhanced configuration for production
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Fixed: false for password-based auth
    flowType: 'pkce', // More secure auth flow
    redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined,
    // Add storage options for better token management
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    storageKey: 'sales-advisor-auth',
    // Configure auto-refresh to happen 60 seconds before token expiry
    autoRefreshBuffer: 60 // seconds before token expiry to refresh
  },
  // Add realtime configuration
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Add auth state change listener for debugging and auto-refresh monitoring
if (typeof window !== 'undefined') {
  supabase.auth.onAuthStateChange((event, session) => {
    console.log(`🔐 Auth event: ${event}`, {
      event,
      hasSession: !!session,
      expiresAt: session?.expires_at ? new Date(session.expires_at * 1000).toISOString() : null,
      expiresIn: session?.expires_in ? `${session.expires_in} seconds` : null,
      timeUntilExpiry: session?.expires_at 
        ? `${Math.round((session.expires_at * 1000 - Date.now()) / 1000 / 60)} minutes`
        : null
    })
    
    // Log token refresh events specifically
    if (event === 'TOKEN_REFRESHED') {
      console.log('✅ Token refreshed successfully')
    }
    
    // Handle session expiry
    if (event === 'SIGNED_OUT') {
      console.log('⚠️ Session expired or user signed out')
      // Could redirect to login page here if needed
    }
  })
}

// Types generados desde la base de datos
export type Organization = {
  id: string
  name: string
  domain: string
  settings: any
  subscription_tier: string
  subscription_status: 'active' | 'inactive' | 'trial' | 'suspended'
  created_at: string
  updated_at: string
}

export type User = {
  id: string
  organization_id: string
  email: string
  full_name: string
  role: 'admin' | 'manager' | 'rep' | 'bdr'
  avatar_url?: string
  preferences?: any
  is_active: boolean
  created_at: string
  updated_at: string
}

export type Contact = {
  id: string
  organization_id: string
  company_id?: string
  assigned_user_id?: string
  full_name: string
  email?: string
  phone?: string
  role_title?: string
  location?: string
  avatar_url?: string
  status: 'hot' | 'warm' | 'cold'
  pipeline_stage?: 'lead' | 'qualified' | 'demo' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost'
  score: number
  probability?: number
  deal_value?: number
  source?: string
  tags?: string[]
  interests?: string[]
  social_profiles?: any
  recent_posts?: any[]
  recent_comments?: any[]
  sentiment_analysis?: any
  user_trends?: any
  personality_insights?: any
  professional_background?: any
  buying_behavior?: any
  engagement_metrics?: any
  ai_insights?: any
  last_activity_at?: string
  last_contact_at?: string
  next_action_date?: string
  next_action_description?: string
  notes_count?: number
  activities_count?: number
  created_at: string
  updated_at: string
  company?: {
    id: string
    name: string
    industry_id?: string
    employee_count?: string
    revenue_range?: string
    location?: string
  }
}

export type Company = {
  id: string
  organization_id: string
  name: string
  domain?: string
  industry_id?: string
  employee_count?: string
  revenue_range?: string
  location?: string
  logo_url?: string
  description?: string
  website?: string
  linkedin_url?: string
  twitter_url?: string
  technologies?: string[]
  funding_stage?: string
  key_contacts?: any
  recent_news?: any[]
  company_insights?: any
  market_position?: any
  buying_signals?: any
  created_at: string
  updated_at: string
}

// Nuevos tipos para el sistema de acciones
export type Action = {
  id: string
  organization_id: string
  user_id: string
  contact_id?: string
  company_id?: string
  type: 'email' | 'call' | 'meeting' | 'task' | 'follow_up' | 'proposal' | 'demo' | 'contract'
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'failed'
  priority: 'high' | 'medium' | 'low'
  title: string
  description?: string
  content?: any // JSONB para contenido estructurado
  due_date?: string
  scheduled_at?: string
  completed_at?: string
  ai_generated: boolean
  prompt_used?: string
  ai_confidence_score?: number
  metadata?: any // JSONB para datos adicionales
  estimated_duration_minutes?: number
  actual_duration_minutes?: number
  success_probability?: number
  tags?: string[]
  category?: string
  created_at: string
  updated_at: string
  // Relaciones
  user?: User
  contact?: Contact
  company?: Company
}

export type ActionTemplate = {
  id: string
  organization_id: string
  type: 'email' | 'call' | 'meeting' | 'task' | 'follow_up' | 'proposal' | 'demo' | 'contract'
  name: string
  description?: string
  template_content: any // JSONB con el contenido del template
  variables?: any // JSONB con variables disponibles
  is_global: boolean
  is_active: boolean
  usage_count: number
  success_rate?: number
  avg_completion_time?: number // En minutos
  ai_optimized: boolean
  ai_optimization_data?: any
  tags?: string[]
  category?: string
  created_at: string
  updated_at: string
  created_by?: string
  // Relaciones
  created_by_user?: User
}

export type ActionAnalytics = {
  id: string
  action_id: string
  organization_id: string
  response_rate?: number
  conversion_rate?: number
  engagement_score?: number
  first_response_time_hours?: number
  total_response_time_hours?: number
  call_duration_minutes?: number // Para llamadas
  meeting_attendance_rate?: number // Para reuniones
  email_open_rate?: number // Para emails
  email_click_rate?: number
  user_rating?: number // 1-5
  contact_feedback?: string
  internal_notes?: string
  analysis_data?: any // JSONB para datos de análisis
  recorded_at: string
  analyzed_at?: string
  // Relaciones
  action?: Action
}

export type ActionSequence = {
  id: string
  organization_id: string
  name: string
  description?: string
  trigger_conditions?: any // JSONB con condiciones para activar
  sequence_steps: any // JSONB con pasos de la secuencia
  is_active: boolean
  execution_count: number
  success_rate?: number
  ai_optimized: boolean
  auto_execute: boolean
  created_at: string
  updated_at: string
  created_by?: string
  // Relaciones
  created_by_user?: User
}

// Tipos helper para la UI
export type ActionWithRelations = Action & {
  user?: User
  contact?: Contact
  company?: Company
  analytics?: ActionAnalytics
}

export type ActionTemplateWithStats = ActionTemplate & {
  recent_usage?: number
  avg_success_rate?: number
  total_actions_created?: number
}

export type ActionSummary = {
  total_actions: number
  pending_actions: number
  completed_actions: number
  success_rate: number
  avg_completion_time: number
  actions_by_type: Record<Action['type'], number>
  actions_by_priority: Record<Action['priority'], number>
}

export type ActionHistory = {
  id: string
  organization_id: string
  action_id?: string
  executed_by: string
  target_contact_id?: string
  target_company_id?: string
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  summary?: string
  result_details?: any
  kpis?: any
  generated_content?: any
  executed_at: string
  completed_at?: string
}