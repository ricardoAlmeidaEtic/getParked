"use client"

import { createContext, useContext, useEffect, useState } from 'react'
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
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        // Check if user has owner or admin role
        console.log('🔍 Checking profile for user:', session.user.id);
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()
        
        console.log('📋 Profile result:', { profile, profileError });
        
        if (profileError) {
          console.error('❌ Profile error:', profileError);
          // Don't sign out immediately - let's see what the error is
          setUser(null)
        } else if (profile?.role === 'owner' || profile?.role === 'admin') {
          console.log('✅ User authorized with role:', profile.role);
          setUser(session.user)
        } else {
          console.log('🚫 User not authorized, role:', profile?.role);
          setUser(null)
          await supabase.auth.signOut()
        }
      } else {
        setUser(null)
      }
      
      setLoading(false)
    }

    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (session?.user) {
          // Check if user has owner or admin role
          console.log('🔄 Auth change - checking profile for user:', session.user.id);
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single()
          
          console.log('📋 Auth change - Profile result:', { profile, profileError });
          
          if (profileError) {
            console.error('❌ Auth change - Profile error:', profileError);
            setUser(null)
          } else if (profile?.role === 'owner' || profile?.role === 'admin') {
            console.log('✅ Auth change - User authorized with role:', profile.role);
            setUser(session.user)
          } else {
            console.log('🚫 Auth change - User not authorized, role:', profile?.role);
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
  }, [supabase, router])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    router.push('/admin/login')
  }

  return (
    <Context.Provider value={{ supabase, user, loading, signOut }}>
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