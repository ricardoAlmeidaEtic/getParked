"use client"

import { useState, useEffect } from 'react'
import { useSupabase } from '@/providers/SupabaseProvider'
import { Profile, UpdateProfileData } from '@/lib/api/profile'
import { showToast } from '@/lib/toast'

export interface Profile {
  id: string
  user_id: string
  plan: 'Free' | 'Premium'
  created_at: string
  updated_at: string
}

export function useProfile() {
  const { supabase, session } = useSupabase()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!session?.user) {
      setProfile(null)
      setLoading(false)
      return
    }

    async function fetchProfile() {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single()

        if (error) throw error
        setProfile(data)
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [session, supabase])

  const updateProfile = async (data: UpdateProfileData) => {
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

      // Atualizar o estado local
      setProfile(updatedProfile)
      showToast.success('Perfil atualizado com sucesso!')
      
      return updatedProfile
    } catch (err) {
      console.error('Erro ao atualizar perfil:', err)
      const error = err instanceof Error ? err : new Error('Erro ao atualizar perfil')
      showToast.error(error.message)
      throw error
    }
  }

  const refreshProfile = async () => {
    await fetchProfile()
  }

  return {
    profile,
    loading,
    error,
    updateProfile,
    refreshProfile
  }
} 