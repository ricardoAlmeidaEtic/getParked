"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useSupabase } from "@/providers/SupabaseProvider"

export function useAuth(requireAuth: boolean = true) {
  const { user, loading } = useSupabase()
  const router = useRouter()
  const pathname = usePathname()
  
  // Páginas de autenticação
  const isAuthPage = pathname.startsWith("/auth")
  
  useEffect(() => {
    if (loading) return
    
    if (!user && requireAuth && !isAuthPage) {
      // Se precisa de autenticação e não está em uma página de auth, redireciona
      router.push("/auth/signin")
    } else if (user && isAuthPage) {
      // Se já está autenticado e está em uma página de auth, redireciona para home
      router.push("/")
    }
  }, [user, loading, requireAuth, isAuthPage, router])
  
  return { user, loading, isAuthenticated: !!user }
}
