"use client"

<<<<<<< HEAD
import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Lock, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import FadeIn from "@/components/animations/fade-in"
import { showToast } from "@/components/ui/toast/toast-config"
import { useSupabase } from "@/providers/SupabaseProvider"
=======
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
>>>>>>> 476f46b (Perfil)

export default function ResetPasswordPage() {
  const router = useRouter()
  const { supabase } = useSupabase()
<<<<<<< HEAD
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [password, setPassword] = useState("")
  const [passwordConfirm, setPasswordConfirm] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)

  useEffect(() => {
    const handleRecovery = async () => {
      // Get the tokens from URL hash
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const accessToken = hashParams.get('access_token')
      const refreshToken = hashParams.get('refresh_token')
      const type = hashParams.get('type')

      console.log('Full URL:', window.location.href) // Debug log
      console.log('Hash params:', Object.fromEntries(hashParams.entries())) // Debug log
      console.log('Recovery params:', { accessToken, type }) // Debug log

      if (!accessToken || !refreshToken || type !== 'recovery') {
        showToast.error("Link de recuperação inválido")
        router.push("/auth/forgot-password")
        return
      }
    }

    handleRecovery()
  }, [router, supabase.auth])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== passwordConfirm) {
      setError("As senhas não coincidem")
      showToast.error("As senhas não coincidem")
      return
    }

    if (password.length < 6) {
      setError("Senha deve ter pelo menos 6 caracteres")
      showToast.error("Senha deve ter pelo menos 6 caracteres")
      return
    }

    setIsLoading(true)

    try {
      // Get the tokens from URL hash
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const accessToken = hashParams.get('access_token')
      const refreshToken = hashParams.get('refresh_token')

      if (!accessToken || !refreshToken) {
        throw new Error("Link de recuperação inválido")
      }

      // Set the session first
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      })

      if (sessionError) throw sessionError

      // Update the password
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      })

      if (updateError) {
        //logout
        await supabase.auth.signOut()
        router.push("/auth/reset-password")
        // If the error is about password being the same, show a specific message
        if (updateError.message.includes('same password')) {
          throw new Error("A nova senha deve ser diferente da senha atual")
        }
        throw updateError
      }

      // Sign out after successful password update
      await supabase.auth.signOut()
      setIsSuccess(true)
      showToast.success("Senha alterada com sucesso!")
      
      setTimeout(() => {
        router.push("/auth/signin")
      }, 2000)
    } catch (error: any) {
      console.error('Submit error:', error) // Debug log
      setError(error.message || "Erro ao redefinir senha")
      showToast.error(error.message || "Erro ao redefinir senha")
=======
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
>>>>>>> 476f46b (Perfil)
    } finally {
      setIsLoading(false)
    }
  }

<<<<<<< HEAD
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex min-h-screen flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <FadeIn direction="down" duration={800}>
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <div className="flex justify-center transition-transform duration-300 hover:scale-105">
              <span className="font-bold text-2xl text-primary uppercase tracking-wider">
                GET<span className="font-black">PARKED</span>
              </span>
            </div>
            <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight">
              {isSuccess ? "Senha alterada!" : "Redefinir senha"}
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              {isSuccess ? (
                "Sua senha foi redefinida com sucesso"
              ) : (
                <>Crie sua nova senha</>
              )}
            </p>
          </div>
        </FadeIn>

        <FadeIn direction="up" duration={800} delay={200}>
          <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white px-6 py-8 shadow sm:rounded-lg sm:px-12">
              {error && (
                <Alert variant="destructive" className="mb-6 animate-shake">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {isSuccess ? (
                <div className="text-center">
                  <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                    <svg
                      className="w-6 h-6 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Sua senha foi redefinida com sucesso. Você será redirecionado para a página de login em instantes.
                  </p>
                </div>
              ) : (
                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div>
                    <Label htmlFor="password">Nova senha</Label>
                    <div className="mt-2 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        required
                        className="pl-10 pr-10 transition-all duration-300 focus:border-primary focus:ring-primary"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-gray-400 hover:text-gray-500 transition-colors duration-300"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">Mínimo de 6 caracteres</p>
                  </div>

                  <div>
                    <Label htmlFor="password-confirm">Confirmar nova senha</Label>
                    <div className="mt-2 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <Input
                        id="password-confirm"
                        name="password-confirm"
                        type={showPassword ? "text" : "password"}
                        required
                        className="pl-10 pr-10 transition-all duration-300 focus:border-primary focus:ring-primary"
                        placeholder="••••••••"
                        value={passwordConfirm}
                        onChange={(e) => setPasswordConfirm(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <Button
                      type="submit"
                      className="w-full transition-all duration-300 hover:bg-primary-hover transform hover:scale-[1.02]"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <span className="flex items-center">
                          <span className="animate-spin mr-2">⏳</span> Redefinindo senha...
                        </span>
                      ) : (
                        <span className="flex items-center">
                          Redefinir senha <ArrowRight className="ml-2 h-4 w-4" />
                        </span>
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </FadeIn>
=======
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
>>>>>>> 476f46b (Perfil)
      </div>
    </div>
  )
}
