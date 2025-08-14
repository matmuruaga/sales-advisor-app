// src/hooks/useSupabase.ts
import { supabase, type User, type Organization } from '@/lib/supabase';

export const useSupabase = () => {
  
  // Mock user and organization data for development
  // En producción, esto debería venir del contexto de autenticación real
  const user: User = {
    id: 'cc99e9f4-f68a-45f8-9d59-282cca1d0f94',
    organization_id: '47fba630-b113-4fe9-b68f-947d79c09fb2',
    email: 'matias@elevaitelabs.io',
    full_name: 'Matias Rodriguez',
    role: 'admin',
    avatar_url: null,
    preferences: {},
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const organization: Organization = {
    id: '47fba630-b113-4fe9-b68f-947d79c09fb2',
    name: 'ElevaiteLabs',
    domain: 'elevaitelabs.io',
    settings: {},
    subscription_tier: 'enterprise',
    subscription_status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  return {
    supabase,
    user,
    organization
  };
};

// Database Types (generated from Supabase)
export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['organizations']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['organizations']['Insert']>;
      };
      users: {
        Row: {
          id: string;
          organization_id: string;
          email: string;
          full_name: string;
          role: 'admin' | 'manager' | 'bdr' | 'rep';
          territory: string | null;
          manager_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      companies: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          domain: string | null;
          industry_id: string | null;
          size_category: string | null;
          revenue_range: string | null;
          headquarters: string | null;
          founded_year: number | null;
          website: string | null;
          logo_url: string | null;
          funding_total: string | null;
          market_cap: string | null;
          stock_symbol: string | null;
          social_activity: any;
          financial_health: any;
          market_position: any;
          technology_stack: any;
          culture_data: any;
          buying_signals: any;
          ai_insights: any;
          key_people: any;
          products: any;
          competitors: any;
          recent_news: any;
          strategic_priorities: any;
          recent_initiatives: any;
          industry_trends: any;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['companies']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['companies']['Insert']>;
      };
      contacts: {
        Row: {
          id: string;
          organization_id: string;
          company_id: string;
          assigned_user_id: string | null;
          full_name: string;
          email: string | null;
          phone: string | null;
          role_title: string | null;
          location: string | null;
          avatar_url: string | null;
          status: 'hot' | 'warm' | 'cold';
          pipeline_stage: 'lead' | 'qualified' | 'demo' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost';
          score: number;
          probability: number;
          deal_value: number | null;
          source: string | null;
          tags: string[];
          interests: string[];
          social_profiles: any;
          recent_posts: any;
          recent_comments: any;
          sentiment_analysis: any;
          user_trends: any;
          personality_insights: any;
          professional_background: any;
          buying_behavior: any;
          engagement_metrics: any;
          ai_insights: any;
          last_activity_at: string | null;
          last_contact_at: string | null;
          next_action_date: string | null;
          next_action_description: string | null;
          notes_count: number;
          activities_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['contacts']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['contacts']['Insert']>;
      };
    };
  };
}