"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSupabase } from "@/providers/SupabaseProvider"
import { showToast } from "@/components/ui/toast/toast-config"

export default function AuthCallbackPage() {
  const router = useRouter()
  const { supabase } = useSupabase()

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { data, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error("Error in auth callback:", error)
        showToast.error("Falha na autenticação. Por favor, tente novamente.")
        router.push("/auth/signin")
      } else if (data?.session) {
        // Successfully authenticated
        showToast.success("Login realizado com sucesso!")
        router.push("/")
      } else {
        // No session, redirect to sign in
        router.push("/auth/signin")
      }
    }

    handleAuthCallback()
  }, [router, supabase.auth])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold mb-2">Autenticando...</h2>
        <p className="text-gray-600">Você será redirecionado em instantes.</p>
      </div>
    </div>
  )
}
