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
      // Cargar perfil del usuario desde la tabla users
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (profileError) {
        console.error('Error loading user profile:', profileError)
        return authUser
      }

      // Cargar información de la organización
      const { data: organization, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', profile.organization_id)
        .single()

      if (orgError) {
        console.error('Error loading organization:', orgError)
      }

      return {
        ...authUser,
        profile,
        organization: organization || undefined
      }
    } catch (error) {
      console.error('Error loading user data:', error)
      return authUser
    }
  }

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    setLoading(false)
    return { error }
  }

  const signOut = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signOut()
    setLoading(false)
    return { error }
  }

  useEffect(() => {
    // Obtener sesión inicial
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session)
      if (session?.user) {
        const enrichedUser = await loadUserProfile(session.user)
        setUser(enrichedUser)
      }
      setLoading(false)
    })

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
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

    return () => subscription.unsubscribe()
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