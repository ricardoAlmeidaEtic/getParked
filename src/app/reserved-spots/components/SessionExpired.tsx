import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export function SessionExpired() {
  const router = useRouter()

  return (
    <main className="flex min-h-screen flex-col">
      <div className="flex-1 pt-24 pb-16 px-4 md:px-8 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Sessão expirada</h1>
        <p className="mb-6">Por favor, faça login novamente para ver suas vagas reservadas.</p>
        <Button onClick={() => router.push("/auth/signin")}>Fazer Login</Button>
      </div>
    </main>
  )
} 