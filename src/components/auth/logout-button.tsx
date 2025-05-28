import { useState } from "react"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSupabase } from "@/providers/SupabaseProvider"
import { showToast } from "@/components/ui/toast/toast-config"

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
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleLogout = async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) throw error
      
      showToast.success("Logout realizado com sucesso")
      router.push("/auth/signin")
    } catch (error: any) {
      showToast.error(error.message || "Erro ao fazer logout")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleLogout}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? (
        <span className="animate-spin">⏳</span>
      ) : (
        <>
          {showIcon && <LogOut className={`h-4 w-4 ${onlyIcon ? "" : "mr-2"}`} />}
          {!onlyIcon && "Sair"}
        </>
      )}
    </Button>
  )
}
