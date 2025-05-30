"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation" 
import { useSupabase } from "@/providers/SupabaseProvider"

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

      // Se não estiver em uma rota pública e não estiver autenticado, redireciona para login
      if (!isPublicRoute && !user) {
        router.push("/auth/signin")
      }

      // Se estiver autenticado e tentar acessar uma rota de auth, redireciona para o dashboard
      if (user && isAuthRoute) {
        router.push("/dashboard")
      }
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

  return <>{children}</>
}
