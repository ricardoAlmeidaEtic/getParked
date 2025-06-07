'use client'

import { createContext, useContext, ReactNode, useState, useEffect } from 'react'
import { SupabaseClient, User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { showToast } from '@/lib/toast'

export type SupabaseContextType = {
  supabase: SupabaseClient
  user: User | null
  session: Session | null
  loading: boolean
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined)

export function SupabaseProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getInitialSession = async () => {
      try {
        setLoading(true)
        const {
          data: { session },
          error: sessionError
        } = await supabase.auth.getSession()

        if (sessionError) {
          console.error('Erro ao obter sessão:', sessionError)
          showToast.error('Erro ao verificar autenticação')
          return
        }

        console.log('Sessão inicial:', session?.user?.id)
        
        // Check if session has owner/admin role - if so, sign them out from frontend
        if (session?.user) {
          console.log('Checking session role for frontend access:', session.user.id)
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single()

          if (!error && profile && (profile.role === 'owner' || profile.role === 'admin')) {
            console.log('Owner/admin detected on frontend, signing out:', profile.role)
            showToast.error('Sessão de administrador detectada. Use /admin/login para acessar área administrativa.')
            await supabase.auth.signOut()
            setSession(null)
            setUser(null)
            return
          }
        }

        // Set session state for clients only
        setSession(session)
        setUser(session?.user ?? null)
      } catch (error) {
        console.error('Erro ao buscar sessão:', error)
        showToast.error('Erro ao verificar autenticação')
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('Auth state changed:', event, newSession?.user?.id)
        
        // Check if session has owner/admin role - if so, sign them out from frontend
        if (newSession?.user) {
          console.log('Checking new session role for frontend access:', newSession.user.id)
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', newSession.user.id)
            .single()

          if (!error && profile && (profile.role === 'owner' || profile.role === 'admin')) {
            console.log('Owner/admin detected on frontend, signing out:', profile.role)
            showToast.error('Sessão de administrador detectada. Use /admin/login para acessar área administrativa.')
            await supabase.auth.signOut()
            setSession(null)
            setUser(null)
            setLoading(false)
            return
          }
        }

        // Set session state for clients only
        setSession(newSession)
        setUser(newSession?.user ?? null)
        
        setLoading(false)
      },
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <SupabaseContext.Provider value={{ supabase, user, session, loading }}>
      {children}
    </SupabaseContext.Provider>
  )
}

export function useSupabase() {
  const context = useContext(SupabaseContext)
  if (!context) {
    throw new Error('useSupabase must be used within a SupabaseProvider')
  }
  return context
}
