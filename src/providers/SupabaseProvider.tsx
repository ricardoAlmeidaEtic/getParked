'use client'

import { createContext, useContext, ReactNode, useState, useEffect } from 'react'
import { SupabaseClient, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

type SupabaseContextType = {
  supabase: SupabaseClient
  user: User | null
  loading: boolean
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined)

export function SupabaseProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar o usuário atual quando o componente é montado
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
    }
  }, [])

  return (
    <SupabaseContext.Provider value={{ supabase, user, loading }}>
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