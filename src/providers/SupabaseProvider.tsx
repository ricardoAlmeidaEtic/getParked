'use client'

import { createContext, useContext, ReactNode, useState, useEffect, useRef } from 'react'
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
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Handle all auth states (including INITIAL_SESSION)
        if (session?.user) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single()

          if (profileError) {
            setSession(null)
            setUser(null)
          } else if (profile?.role === 'client' || !profile?.role) {
            setSession(session)
            setUser(session.user)
          } else {
            setSession(null)
            setUser(null)
          }
        } else {
          setSession(null)
          setUser(null)
        }
        
        setLoading(false)
      },
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const value = {
    supabase,
    user,
    session,
    loading
  }

  return (
    <SupabaseContext.Provider value={value}>
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
