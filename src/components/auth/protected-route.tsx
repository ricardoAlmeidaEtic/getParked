"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation" 
import { useSupabase } from "@/providers/SupabaseProvider"

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useSupabase()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading && !user && !pathname.startsWith("/auth")) {
      router.push("/auth/signin")
    }
  }, [user, loading, router, pathname])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Carregando...</h2>
          <p className="text-gray-600">Por favor, aguarde.</p>
        </div>
      </div>
    )
  }

  // Se estamos em uma página de autenticação e o usuário já está autenticado, redirecionar para a página inicial
  if (!loading && user && pathname.startsWith("/auth")) {
    router.push("/")
    return null
  }

  // Se não estamos em uma página de autenticação e o usuário não está autenticado, o hook useEffect tratará o redirecionamento
  // Se estamos em uma página de autenticação ou o usuário está autenticado, renderizar o conteúdo normalmente
  return <>{children}</>
}
