"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabase } from '@/providers/SupabaseProvider'
import { useProfile } from '@/hooks/useProfile'
import { Button } from '@/components/ui/button'
import { Spot } from '@/types/spot'

export default function ReservedSpotsPage() {
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
          <p className="mb-6">Por favor, inicie sessão novamente para ver os seus lugares reservados.</p>
          <Button onClick={() => router.push("/auth/signin")}>Iniciar sessão</Button>
        </div>
      </main>
    )
  }

  // ... rest of the existing code ...
} 
