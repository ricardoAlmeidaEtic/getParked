"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabase } from '@/providers/SupabaseProvider'
import { useProfile } from '@/hooks/useProfile'
import { Button } from '@/components/ui/button'
import { Spot } from '@/types/spot'

export default function RentedSpotsPage() {
  const router = useRouter()
  const { supabase, user } = useSupabase()
  const { profile, loading: profileLoading } = useProfile()
  const [spots, setSpots] = useState<Spot[]>([])
  const [loading, setLoading] = useState(true)

  // Redirecionar se não houver usuário
  if (!user) {
    return (
      <main className="flex min-h-screen flex-col">
        <div className="flex-1 pt-24 pb-16 px-4 md:px-8 flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold mb-4">Sessão expirada</h1>
          <p className="mb-6">Por favor, faça login novamente para ver suas vagas alugadas.</p>
          <Button onClick={() => router.push("/auth/signin")}>Fazer Login</Button>
        </div>
      </main>
    )
  }

  // Exibir tela de carregamento
  if (profileLoading || loading) {
    return (
      <main className="flex min-h-screen flex-col">
        <div className="flex-1 pt-24 pb-16 px-4 md:px-8 flex items-center justify-center">
          <div className="animate-spin text-primary text-4xl">⏳</div>
        </div>
      </main>
    )
  }

  if (!profile) {
    return (
      <main className="flex min-h-screen flex-col">
        <div className="flex-1 pt-24 pb-16 px-4 md:px-8 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Erro ao carregar perfil</h1>
            <p className="mb-6">Não foi possível carregar os seus dados de utilizador.</p>
            <Button onClick={() => window.location.reload()}>Tentar novamente</Button>
          </div>
        </div>
      </main>
    )
  }

  // ... rest of the existing code ...
} 