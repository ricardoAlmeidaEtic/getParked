"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSupabase } from "@/providers/SupabaseProvider"
import { showToast } from "@/components/ui/toast"

interface LogoutButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  className?: string
}

export default function LogoutButton({ 
  variant = "default", 
  className = "" 
}: LogoutButtonProps) {
  const router = useRouter()
  const { supabase } = useSupabase()
  const [isLoading, setIsLoading] = useState(false)

  const handleLogout = async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) throw error
      
      showToast.success("Logout realizado com sucesso!")
      router.push("/auth/signin")
    } catch (error) {
      console.error("Erro ao fazer logout:", error)
      showToast.error("Erro ao fazer logout. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button 
      onClick={handleLogout}
      variant={variant}
      className={className}
      disabled={isLoading}
    >
      {isLoading ? (
        <span className="flex items-center">
          <span className="animate-spin mr-2">⏳</span> Saindo...
        </span>
      ) : (
        <span className="flex items-center">
          <LogOut className="h-4 w-4 mr-2" /> Sair
        </span>
      )}
    </Button>
  )
}
