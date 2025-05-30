"use client"
import { useState } from "react"
import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSupabase } from "@/providers/SupabaseProvider"
import { showToast } from "@/components/ui/toast"

interface LogoutButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  showIcon?: boolean
  className?: string
  onlyIcon?: boolean
}

export default function LogoutButton({
  variant = "default",
  size = "default",
  showIcon = true,
  className = "",
  onlyIcon = false
}: LogoutButtonProps) {
  const { supabase } = useSupabase()
  const [isLoading, setIsLoading] = useState(false)

  const handleLogout = async () => {
    if (isLoading) return // Previne múltiplos cliques
    
    setIsLoading(true)
    try {
      // Redireciona primeiro para a página inicial
      window.location.href = "/"
      
      // Depois faz o logout
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      // Mostra mensagem de sucesso
      showToast.success("Logout realizado com sucesso!")
    } catch (error) {
      console.error("Erro ao fazer logout:", error)
      showToast.error("Erro ao fazer logout. Tente novamente.")
      setIsLoading(false)
    }
  }

  return (
    <Button 
      onClick={handleLogout}
      variant={variant}
      size={size}
      className={className}
      disabled={isLoading}
    >
      {isLoading ? (
        <span className="flex items-center">
          <span className="animate-spin mr-2">⏳</span> Saindo...
        </span>
      ) : (
        <>
          {showIcon && <LogOut className={`h-4 w-4 ${onlyIcon ? "" : "mr-2"}`} />}
          {!onlyIcon && "Sair"}
        </>
      )}
    </Button>
  )
}
