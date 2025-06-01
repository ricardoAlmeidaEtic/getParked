import { useSupabase } from "@/providers/SupabaseProvider"
import { showToast } from "@/components/ui/toast"

export const useLogout = () => {
  const { supabase } = useSupabase()

  const handleLogout = async () => {
    try {
      // 1. Limpa todos os dados de sessão
      localStorage.clear()
      sessionStorage.clear()
      
      // 2. Remove tokens específicos do Supabase
      localStorage.removeItem('supabase.auth.token')
      localStorage.removeItem('sb-avddkzoyhyiipoonuiqu-auth-token')
      
      // 3. Faz logout no Supabase
      const { error } = await supabase.auth.signOut()
      if (error && !error.message.includes("Auth session missing")) {
        throw error
      }
      
      // 4. Força uma atualização do estado do Supabase
      await supabase.auth.getSession()
      
      // 5. Mostra mensagem de sucesso
      showToast.success("Logout realizado com sucesso!")
      
      // 6. Força um reload completo da página
      window.location.replace("/")
    } catch (error) {
      console.error("Erro ao fazer logout:", error)
      showToast.error("Erro ao fazer logout. Tente novamente.")
    }
  }

  return { handleLogout }
} 