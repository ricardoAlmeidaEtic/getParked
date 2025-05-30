"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation" 
import { useSupabase } from "@/providers/SupabaseProvider"
import { showToast } from "@/lib/toast"

interface ProtectedRouteProps {
  children: React.ReactNode
}

// Lista de rotas públicas que não precisam de autenticação
const publicRoutes = [
  "/",
  "/auth/signin",
  "/auth/signup",
  "/auth/forgot-password",
  "/auth/reset-password",
]

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useSupabase()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading) {
      const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route + "/"))
      const isAuthRoute = pathname.startsWith("/auth")

      // Se não estiver em uma rota pública e não estiver autenticado
      if (!isPublicRoute && !user) {
        // Não mostra mensagem de erro se estiver na landing page ou durante o logout
        if (pathname !== "/" && !pathname.includes("logout")) {
          showToast.error("Por favor, faça login para acessar esta página")
        }
        router.push("/")
        return
      }

      // Se estiver autenticado e tentar acessar uma rota de auth, redireciona para o dashboard
      if (user && isAuthRoute) {
        router.push("/dashboard")
        return
      }
    }
  }, [user, loading, router, pathname])

  // Mostra um loading enquanto verifica a autenticação
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Verificando autenticação...</h2>
          <p className="text-gray-600">Por favor, aguarde.</p>
        </div>
      </div>
    )
  }

  // Se não estiver em uma rota pública e não estiver autenticado, não renderiza nada
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route + "/"))
  if (!isPublicRoute && !user) {
    return null
  }

  // Renderiza o conteúdo normalmente se estiver autenticado ou em uma rota pública
  return <>{children}</>
}
