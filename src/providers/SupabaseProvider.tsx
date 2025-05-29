'use client'

import { createContext, useContext, ReactNode, useState, useEffect } from 'react'
<<<<<<< HEAD
import { SupabaseClient, User } from '@supabase/supabase-js'
=======
import { SupabaseClient, User, Session } from '@supabase/supabase-js'
>>>>>>> 476f46b (Perfil)
import { supabase } from '@/lib/supabase'

type SupabaseContextType = {
  supabase: SupabaseClient
  user: User | null
  loading: boolean
<<<<<<< HEAD
=======
  session: Session | null
>>>>>>> 476f46b (Perfil)
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined)

export function SupabaseProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
<<<<<<< HEAD
=======
  const [session, setSession] = useState<Session | null>(null)
>>>>>>> 476f46b (Perfil)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar o usuário atual quando o componente é montado
<<<<<<< HEAD
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    getUser()

    // Configurar listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null)
      setLoading(false)
    })

    // Limpar o listener ao desmontar
    return () => {
      subscription?.unsubscribe()
=======
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
>>>>>>> 476f46b (Perfil)
    }
  }, [])

  return (
<<<<<<< HEAD
    <SupabaseContext.Provider value={{ supabase, user, loading }}>
=======
    <SupabaseContext.Provider value={{ supabase, user, loading, session }}>
>>>>>>> 476f46b (Perfil)
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