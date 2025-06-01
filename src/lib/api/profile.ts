import { supabase } from '@/lib/supabase'

export interface Profile {
  id: string
  role: 'client' | 'owner'
  full_name: string
  email: string
  credits: number
  plan: string
  profile_image?: string
  join_date: string
  created_at: string
  updated_at: string
}

export interface UpdateProfileData {
  full_name?: string
  profile_image?: string
}

export const profileApi = {
  // Buscar perfil do usuário
  async getProfile(userId: string): Promise<Profile | null> {
    try {
      console.log('Buscando perfil para usuário:', userId)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Erro ao buscar perfil:', error)
        if (error.code === 'PGRST116') {
          console.log('Perfil não encontrado, criando novo perfil')
          return this.createProfile(userId, {
            full_name: userId.split('@')[0] // Fallback para nome do usuário
          })
        }
        throw error
      }

      console.log('Perfil encontrado:', data)
      return data
    } catch (error) {
      console.error('Erro ao buscar perfil:', error)
      throw error
    }
  },

  // Atualizar perfil do usuário
  async updateProfile(userId: string, data: UpdateProfileData): Promise<Profile> {
    try {
      console.log('Atualizando perfil para usuário:', userId, data)
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

      console.log('Perfil atualizado com sucesso:', updatedProfile)
      return updatedProfile
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error)
      throw error
    }
  },

  // Criar perfil do usuário
  async createProfile(userId: string, data: { full_name: string }): Promise<Profile> {
    try {
      console.log('Criando perfil para usuário:', userId, data)
      const { data: newProfile, error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          role: 'client',
          full_name: data.full_name,
          credits: 0,
          plan: 'Gratuito',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        console.error('Erro ao criar perfil:', error)
        throw error
      }

      console.log('Perfil criado com sucesso:', newProfile)
      return newProfile
    } catch (error) {
      console.error('Erro ao criar perfil:', error)
      throw error
    }
  },

  // Verificar e incrementar contador de buscas
  async incrementSearchCount(userId: string): Promise<boolean> {
    try {
      console.log('Verificando contador de buscas para usuário:', userId)
      const profile = await this.getProfile(userId)
      if (!profile) throw new Error('Perfil não encontrado')

      const maxSearches = profile.plan === 'Premium' ? 50 : 3
      
      // Buscar contagem de buscas do dia
      const today = new Date().toISOString().split('T')[0]
      const { data: searches, error: searchError } = await supabase
        .from('daily_searches')
        .select('count')
        .eq('user_id', userId)
        .gte('searched_at', today)
        .lt('searched_at', new Date(new Date(today).getTime() + 24 * 60 * 60 * 1000).toISOString())
        .single()

      if (searchError && searchError.code !== 'PGRST116') throw searchError

      const currentSearches = searches?.count || 0
      console.log('Buscas atuais:', currentSearches, 'Máximo:', maxSearches)
      
      if (currentSearches >= maxSearches) {
        throw new Error(`Limite diário de ${maxSearches} buscas atingido`)
      }

      // Incrementar contador
      const { error: incrementError } = await supabase
        .from('daily_searches')
        .insert({
          user_id: userId,
          searched_at: new Date().toISOString()
        })

      if (incrementError) throw incrementError
      console.log('Contador de buscas incrementado com sucesso')
      return true
    } catch (error) {
      console.error('Erro ao incrementar contador de buscas:', error)
      throw error
    }
  },

  // Verificar limite de veículos
  async canAddVehicle(userId: string): Promise<boolean> {
    try {
      console.log('Verificando limite de veículos para usuário:', userId)
      const profile = await this.getProfile(userId)
      if (!profile) throw new Error('Perfil não encontrado')

      const maxVehicles = profile.plan === 'Premium' ? 3 : 1
      
      // Buscar contagem de veículos
      const { data: vehicles, error: vehicleError } = await supabase
        .from('vehicles')
        .select('id', { count: 'exact' })
        .eq('owner_id', userId)

      if (vehicleError) throw vehicleError

      const currentVehicles = vehicles?.length || 0
      console.log('Veículos atuais:', currentVehicles, 'Máximo:', maxVehicles)
      return currentVehicles < maxVehicles
    } catch (error) {
      console.error('Erro ao verificar limite de veículos:', error)
      throw error
    }
  }
} 