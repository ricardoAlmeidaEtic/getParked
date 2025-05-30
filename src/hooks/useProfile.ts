"use client"

import { useState, useEffect } from 'react'
import { useSupabase } from '@/providers/SupabaseProvider'
import { Profile } from '@/lib/api/profile'

export function useProfile() {
  const { supabase, session } = useSupabase()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!session) {
      setProfile(null)
      setLoading(false)
      return
    }

    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (error) throw error

        setProfile(data)
      } catch (err) {
        console.error('Erro ao carregar perfil:', err)
        setError(err instanceof Error ? err : new Error('Erro ao carregar perfil'))
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [session, supabase])

  const updateProfile = async (data: { full_name?: string }) => {
    if (!session) throw new Error('Usuário não autenticado')

    try {
      // Atualizar metadata do usuário no Auth
      const { error: authError } = await supabase.auth.updateUser({
        data: { full_name: data.full_name }
      })

      if (authError) throw authError

      // Atualizar perfil no banco de dados
      const { data: updatedProfile, error: profileError } = await supabase
        .from('profiles')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', session.user.id)
        .select()
        .single()

      if (profileError) throw profileError

      setProfile(updatedProfile)
      return updatedProfile
    } catch (err) {
      console.error('Erro ao atualizar perfil:', err)
      throw err instanceof Error ? err : new Error('Erro ao atualizar perfil')
    }
  }

  return {
    profile,
    loading,
    error,
    updateProfile
  }
} 