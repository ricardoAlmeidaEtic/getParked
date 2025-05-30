import { useProfile } from '@/hooks/useProfile'

export default function RegisterSpotPage() {
  const router = useRouter()
  const { supabase, user } = useSupabase()
  const { profile, loading: profileLoading } = useProfile()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    address: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    zipCode: "",
    price: "",
    description: "",
    photos: [] as string[],
  })

  // Redirecionar se não houver usuário
  if (!user) {
    return (
      <main className="flex min-h-screen flex-col">
        <div className="flex-1 pt-24 pb-16 px-4 md:px-8 flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold mb-4">Sessão expirada</h1>
          <p className="mb-6">Por favor, faça login novamente para registrar uma vaga.</p>
          <Button onClick={() => router.push("/auth/signin")}>Fazer Login</Button>
        </div>
      </main>
    )
  }

  // Exibir tela de carregamento
  if (profileLoading) {
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
            <p className="mb-6">Não foi possível carregar seus dados de usuário.</p>
            <Button onClick={() => window.location.reload()}>Tentar novamente</Button>
          </div>
        </div>
      </main>
    )
  }

  // ... rest of the existing code ...
} 