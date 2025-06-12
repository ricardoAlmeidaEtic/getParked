import { Button } from '@/components/ui/button'

export function ProfileError() {
  return (
    <main className="flex min-h-screen flex-col">
      <div className="flex-1 pt-24 pb-16 px-4 md:px-8 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Erro ao carregar perfil</h1>
          <p className="mb-6">Não foi possível carregar seus dados de usuário.</p>
          <Button onClick={() => window.location.reload()}>Tentar novamente</Button>
        </div>
      </div>
    </main>
  )
} 