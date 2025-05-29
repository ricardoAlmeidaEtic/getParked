"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, Lock } from "lucide-react"
import { useSupabase } from "@/providers/SupabaseProvider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { showToast } from "@/components/ui/toast"
import AuthHeader from "@/components/auth/auth-header"
import AuthTerms from "@/components/auth/auth-terms"
import FadeIn from "@/components/animations/fade-in"

export default function ResetPasswordPage() {
  const router = useRouter()
  const { supabase } = useSupabase()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validar senhas
    if (password !== confirmPassword) {
      showToast.error("As senhas não coincidem.")
      return
    }
    
    if (password.length < 6) {
      showToast.error("A senha deve ter pelo menos 6 caracteres.")
      return
    }
    
    setIsLoading(true)
    
    try {
      // Usar o hash da URL para redefinir a senha
      const { error } = await supabase.auth.updateUser({ password })
      
      if (error) throw error
      
      showToast.success("Senha redefinida com sucesso!")
      router.push("/auth/signin")
    } catch (error: any) {
      console.error("Erro ao redefinir senha:", error)
      showToast.error(error.message || "Ocorreu um erro ao redefinir sua senha.")
    } finally {
      setIsLoading(false)
    }
  }

  const toggleShowPassword = () => setShowPassword(!showPassword)

  return (
    <div className="flex min-h-screen bg-background">
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <AuthHeader title="Redefinir senha" />
          
          <div className="mt-8">
            <div className="mt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="password" className="flex items-center gap-2">
                    <Lock className="h-4 w-4" /> Nova senha
                  </Label>
                  <div className="mt-1 relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Sua nova senha"
                      required
                      className="block w-full"
                    />
                    <button
                      type="button"
                      onClick={toggleShowPassword}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                    <Lock className="h-4 w-4" /> Confirme a nova senha
                  </Label>
                  <div className="mt-1 relative">
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirme sua nova senha"
                      required
                      className="block w-full"
                    />
                  </div>
                </div>

                <div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Processando..." : "Redefinir senha"}
                  </Button>
                </div>
              </form>

              <div className="mt-6 text-center">
                <Link
                  href="/auth/signin"
                  className="text-sm font-medium text-primary hover:text-primary/90"
                >
                  Voltar para login
                </Link>
              </div>
            </div>
          </div>
          
          <AuthTerms />
        </div>
      </div>
      <div className="hidden lg:block relative w-0 flex-1">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-400 flex items-center justify-center">
          <div className="max-w-2xl p-8">
            <h2 className="text-3xl font-bold text-white mb-6">Crie uma nova senha segura</h2>
            <p className="text-blue-100 text-lg">
              Escolha uma senha forte e única para proteger sua conta. Recomendamos usar uma combinação de letras maiúsculas e minúsculas, números e caracteres especiais.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
