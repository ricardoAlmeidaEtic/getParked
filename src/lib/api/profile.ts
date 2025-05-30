import { supabase } from '@/lib/supabase'

export interface Profile {
  id: string
  role: 'client' | 'owner'
  full_name: string
  credits: number
  created_at: string
  updated_at?: string
}

export interface UpdateProfileData {
  full_name?: string
}

export const profileApi = {
  // Buscar perfil do usuário
  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Erro ao buscar perfil:', error)
      return null
    }

    return data
  },

  // Atualizar perfil do usuário
  async updateProfile(userId: string, data: UpdateProfileData): Promise<Profile> {
    const { data: updatedProfile, error } = await supabase
      .from('profiles')
      .update({
        ...data,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar perfil:', error)
      throw error
    }

    return updatedProfile
  },

  // Criar perfil do usuário
  async createProfile(userId: string, data: { full_name: string }): Promise<Profile> {
    const { data: newProfile, error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        role: 'client',
        full_name: data.full_name,
        credits: 0,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar perfil:', error)
      throw error
    }

    return newProfile
  },

  // Verificar e incrementar contador de buscas
  async incrementSearchCount(userId: string): Promise<boolean> {
    try {
      const profile = await this.getProfile(userId)
      if (!profile) throw new Error('Perfil não encontrado')

      const maxSearches = profile.plan === 'Premium' ? 50 : 3
      const currentSearches = profile.daily_searches ?? 0
      
      if (currentSearches >= maxSearches) {
        throw new Error(`Limite diário de ${maxSearches} buscas atingido`)
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          daily_searches: currentSearches + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Erro ao incrementar contador de buscas:', error)
      throw error
    }
  },

  // Verificar limite de veículos
  async canAddVehicle(userId: string): Promise<boolean> {
    try {
      const profile = await this.getProfile(userId)
      if (!profile) throw new Error('Perfil não encontrado')

      const maxVehicles = profile.plan === 'Premium' ? 3 : 1
      const currentVehicles = profile.vehicles?.length || 0

      return currentVehicles < maxVehicles
    } catch (error) {
      console.error('Erro ao verificar limite de veículos:', error)
      throw error
    }
  }
} 