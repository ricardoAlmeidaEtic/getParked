'use client'

import { createContext, useContext, ReactNode, useState, useEffect } from 'react'
import { SupabaseClient, User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { showToast } from '@/lib/toast'

type SupabaseContextType = {
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
        } = await supabase.auth.getSession()

        setSession(session)
        setUser(session?.user ?? null)

        // Se houver uma sessão, verificar se o perfil existe
        if (session?.user) {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (error) {
            console.error('Erro ao verificar perfil:', error)
            showToast.error('Erro ao verificar perfil')
          }

          if (!profile) {
            showToast.error('Perfil não encontrado')
          }
        }
      } catch (error) {
        console.error('Erro ao buscar sessão:', error)
        showToast.error('Erro ao verificar autenticação')
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        setSession(newSession)
        setUser(newSession?.user ?? null)
        setLoading(false)

        // Se houver uma nova sessão, verificar se o perfil existe
        if (newSession?.user) {
          try {
            const { data: profile, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', newSession.user.id)
              .single()

            if (error) {
              console.error('Erro ao verificar perfil:', error)
              showToast.error('Erro ao verificar perfil')
            }

            if (!profile) {
              showToast.error('Perfil não encontrado')
            }
          } catch (error) {
            console.error('Erro ao verificar perfil:', error)
            showToast.error('Erro ao verificar perfil')
          }
        }
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
