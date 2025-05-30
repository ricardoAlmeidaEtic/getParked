'use client'

import { createContext, useContext, ReactNode, useState, useEffect } from 'react'
import { SupabaseClient, User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

type SupabaseContextType = {
  supabase: SupabaseClient
  user: User | null
  loading: boolean
  session: Session | null
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined)

export function SupabaseProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar o usuário atual quando o componente é montado
    const getInitialSession = async () => {
      try {
        setLoading(true)
        // Obter a sessão atual
        const { data: { session } } = await supabase.auth.getSession()
        setSession(session)
        setUser(session?.user ?? null)
        
        // Obter detalhes do usuário atual
        if (session) {
          const { data: { user } } = await supabase.auth.getUser()
          setUser(user)
        }
      } catch (error) {
        console.error('Erro ao buscar sessão:', error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Configurar listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event: string, newSession: Session | null) => {
        setSession(newSession)
        setUser(newSession?.user ?? null)
        setLoading(false)
      }
    )

    // Limpar o listener ao desmontar
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <SupabaseContext.Provider value={{ supabase, user, loading, session }}>
      {children}
    </SupabaseContext.Provider>
  )
}

export function useSupabase() {
  const context = useContext(SupabaseContext)
  if (context === undefined) {
    throw new Error('useSupabase deve ser usado dentro de um SupabaseProvider')
  }
  return context
}