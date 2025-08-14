'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User as SupabaseUser, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { User, Organization } from '@/lib/supabase'

interface AuthUser extends SupabaseUser {
  profile?: User
  organization?: Organization
}

interface AuthContextType {
  user: AuthUser | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<{ error: any }>
  hasRole: (role: string | string[]) => boolean
  isAdmin: boolean
  isManager: boolean
  canViewAllContacts: boolean
  canManageUsers: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  const hasRole = (roles: string | string[]) => {
    if (!user?.profile) return false
    const userRole = user.profile.role
    const roleArray = Array.isArray(roles) ? roles : [roles]
    return roleArray.includes(userRole)
  }

  const isAdmin = hasRole('admin')
  const isManager = hasRole(['admin', 'manager'])
  const canViewAllContacts = hasRole(['admin', 'manager'])
  const canManageUsers = hasRole('admin')

  const loadUserProfile = async (authUser: SupabaseUser) => {
    try {
      console.log('👤 Loading user profile for:', authUser.id)
      
      // Cargar perfil del usuario desde la tabla users
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (profileError) {
        console.error('❌ Error loading user profile:', profileError.message)
        // Return auth user without profile if profile doesn't exist
        return {
          ...authUser,
          profile: null,
          organization: undefined
        }
      }

      console.log('✅ User profile loaded:', profile.email, profile.role)

      // Cargar información de la organización
      const { data: organization, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', profile.organization_id)
        .single()

      if (orgError) {
        console.error('⚠️ Error loading organization:', orgError.message)
      } else {
        console.log('🏢 Organization loaded:', organization.name)
      }

      return {
        ...authUser,
        profile,
        organization: organization || undefined
      }
    } catch (error) {
      console.error('💥 Unexpected error loading user data:', error)
      return {
        ...authUser,
        profile: null,
        organization: undefined
      }
    }
  }

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      console.log('🔐 Attempting sign in for:', email)
      
      // Create timeout promise (15 seconds)
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Authentication timeout')), 15000)
      })
      
      // Test connectivity first with timeout
      try {
        const healthCheckPromise = supabase
          .from('organizations')
          .select('count')
          .limit(1)
        
        const { data: healthCheck, error: healthError } = await Promise.race([
          healthCheckPromise,
          timeoutPromise
        ]) as any
        
        if (healthError && healthError.message.includes('fetch')) {
          console.error('❌ Connectivity issue:', healthError.message)
          setLoading(false)
          return { error: { message: 'Error de conectividad con Supabase. Verifica la configuración.' } }
        }
      } catch (timeoutError) {
        console.error('⏱️ Health check timeout')
      }
      
      // Sign in with timeout protection
      const signInPromise = supabase.auth.signInWithPassword({
        email,
        password
      })
      
      const { data, error } = await Promise.race([
        signInPromise,
        timeoutPromise.then(() => ({ 
          data: null, 
          error: { message: 'Authentication timeout. Please try again.' } 
        }))
      ]) as any
      
      if (error) {
        console.error('❌ Sign in error:', error.message)
        setLoading(false)
        return { error }
      }
      
      if (data?.user) {
        console.log('✅ Sign in successful for user:', data.user.id)
        // Don't set loading to false here, let the auth state change handle it
        return { error: null }
      }
      
      setLoading(false)
      return { error: null }
    } catch (err) {
      console.error('💥 Unexpected sign in error:', err)
      setLoading(false)
      const errorMessage = err instanceof Error && err.message === 'Authentication timeout'
        ? 'La autenticación tardó demasiado. Por favor intenta de nuevo.'
        : 'Network error. Please check your connection and Supabase configuration.'
      return { error: { message: errorMessage } }
    }
  }

  const signOut = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signOut()
    setLoading(false)
    return { error }
  }

  useEffect(() => {
    let mounted = true

    // Obtener sesión inicial
    const initializeAuth = async () => {
      try {
        console.log('🚀 Initializing authentication...')
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('❌ Error getting session:', error.message)
          if (mounted) {
            setSession(null)
            setUser(null)
            setLoading(false)
          }
          return
        }

        if (mounted) {
          setSession(session)
          if (session?.user) {
            console.log('✅ Session found for user:', session.user.email)
            const enrichedUser = await loadUserProfile(session.user)
            setUser(enrichedUser)
          } else {
            console.log('ℹ️ No active session found')
          }
          setLoading(false)
        }
      } catch (err) {
        console.error('💥 Unexpected auth initialization error:', err)
        if (mounted) {
          setSession(null)
          setUser(null)
          setLoading(false)
        }
      }
    }

    initializeAuth()

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state changed:', event, session?.user?.email || 'no user')
        
        if (!mounted) return

        setSession(session)
        
        if (session?.user) {
          const enrichedUser = await loadUserProfile(session.user)
          setUser(enrichedUser)
        } else {
          setUser(null)
        }
        
        setLoading(false)
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const value = {
    user,
    session,
    loading,
    signIn,
    signOut,
    hasRole,
    isAdmin,
    isManager,
    canViewAllContacts,
    canManageUsers
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Hook para requerir autenticación
export function useRequireAuth() {
  const auth = useAuth()
  
  useEffect(() => {
    if (!auth.loading && !auth.user) {
      window.location.href = '/login'
    }
  }, [auth.loading, auth.user])
  
  return auth
}

// Hook para verificar permisos
export function usePermissions() {
  const auth = useAuth()
  
  return {
    canView: (resource: string) => {
      // Implementar lógica de permisos específica
      return auth.isAdmin || auth.isManager
    },
    canEdit: (resource: string) => {
      return auth.isAdmin
    },
    canDelete: (resource: string) => {
      return auth.isAdmin
    }
  }
}