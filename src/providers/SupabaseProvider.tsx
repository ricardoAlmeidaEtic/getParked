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
          error: sessionError
        } = await supabase.auth.getSession()

        if (sessionError) {
          console.error('Erro ao obter sessão:', sessionError)
          showToast.error('Erro ao verificar autenticação')
          return
        }

        console.log('Sessão inicial:', session?.user?.id)
        setSession(session)
        setUser(session?.user ?? null)

        // Se houver uma sessão, verificar se o perfil existe
        if (session?.user) {
          console.log('Verificando perfil para usuário:', session.user.id)
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (error) {
            console.error('Erro ao verificar perfil:', error)
            if (error.code === 'PGRST116') {
              // Perfil não existe, vamos criar
              console.log('Criando novo perfil para usuário:', session.user.id)
              const { data: newProfile, error: createError } = await supabase
                .from('profiles')
                .insert({
                  id: session.user.id,
                  full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
                  email: session.user.email,
                  role: 'client',
                  credits: 0,
                  plan: 'Gratuito',
                  join_date: new Date().toISOString(),
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                })
                .select()
                .single()

              if (createError) {
                console.error('Erro ao criar perfil:', createError)
                showToast.error('Erro ao criar perfil')
              } else {
                console.log('Perfil criado com sucesso:', newProfile)
              }
            } else {
              showToast.error('Erro ao verificar perfil')
            }
          } else {
            console.log('Perfil encontrado:', profile)
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
      async (event, newSession) => {
        console.log('Auth state changed:', event, newSession?.user?.id)
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
              if (error.code === 'PGRST116') {
                // Perfil não existe, vamos criar
                console.log('Criando novo perfil para usuário:', newSession.user.id)
                const { data: newProfile, error: createError } = await supabase
                  .from('profiles')
                  .insert({
                    id: newSession.user.id,
                    full_name: newSession.user.user_metadata?.full_name || newSession.user.email?.split('@')[0],
                    email: newSession.user.email,
                    role: 'client',
                    credits: 0,
                    plan: 'Gratuito',
                    join_date: new Date().toISOString(),
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                  })
                  .select()
                  .single()

                if (createError) {
                  console.error('Erro ao criar perfil:', createError)
                  showToast.error('Erro ao criar perfil')
                } else {
                  console.log('Perfil criado com sucesso:', newProfile)
                }
              } else {
                showToast.error('Erro ao verificar perfil')
              }
            } else {
              console.log('Perfil encontrado:', profile)
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
