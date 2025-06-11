"use client"

import { createContext, useContext, useEffect, useState, useRef } from 'react'
import { SupabaseClient, User, Session, AuthChangeEvent } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type AdminSupabaseContext = {
  supabase: SupabaseClient
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

const Context = createContext<AdminSupabaseContext | undefined>(undefined)

export default function AdminSupabaseProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        // Handle all auth states (including INITIAL_SESSION)
        if (session?.user) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single()

          if (profileError) {
            setUser(null)
          } else if (profile?.role === 'owner' || profile?.role === 'admin') {
            setUser(session.user)
          } else {
            setUser(null)
            await supabase.auth.signOut()
          }
        } else {
          setUser(null)
        }
        
        setLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    router.push('/admin/login')
  }

  const value = {
    supabase,
    user,
    loading,
    signOut
  }

  return (
    <Context.Provider value={value}>
      {children}
    </Context.Provider>
  )
}

export const useAdminSupabase = () => {
  const context = useContext(Context)
  if (context === undefined) {
    throw new Error('useAdminSupabase must be used inside AdminSupabaseProvider')
  }
  return context
} 