"use client"

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
import { useLogout } from "@/hooks/useLogout"

export default function ResetPasswordPage() {
  const router = useRouter()
  const { supabase } = useSupabase()
  const { handleLogout } = useLogout()

  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [password, setPassword] = useState("")
  const [passwordConfirm, setPasswordConfirm] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)

  useEffect(() => {
    const handleRecovery = async () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const accessToken = hashParams.get("access_token")
      const refreshToken = hashParams.get("refresh_token")
      const type = hashParams.get("type")

      if (!accessToken || !refreshToken || type !== "recovery") {
        showToast.error("Link de recuperação inválido")
        router.push("/auth/forgot-password")
      }
    }

    handleRecovery()
  }, [router, supabase.auth])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== passwordConfirm) {
      const msg = "As senhas não coincidem"
      setError(msg)
      showToast.error(msg)
      return
    }

    if (password.length < 6) {
      const msg = "Senha deve ter pelo menos 6 caracteres"
      setError(msg)
      showToast.error(msg)
      return
    }

    setIsLoading(true)

    try {
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const accessToken = hashParams.get("access_token")
      const refreshToken = hashParams.get("refresh_token")

      if (!accessToken || !refreshToken) {
        throw new Error("Link de recuperação inválido")
      }

      const { error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      })

      if (sessionError) throw sessionError

      const { error: updateError } = await supabase.auth.updateUser({
        password,
      })

      if (updateError) {
        await handleLogout()
        router.push("/auth/reset-password")

        if (updateError.message.includes("same password")) {
          throw new Error("A nova senha deve ser diferente da senha atual")
        }

        throw updateError
      }

      await handleLogout()
      setIsSuccess(true)
      showToast.success("Senha alterada com sucesso!")

      setTimeout(() => {
        router.push("/auth/signin")
      }, 2000)
    } catch (error: any) {
      console.error("Erro ao redefinir senha:", error)
      const msg = error.message || "Erro ao redefinir senha"
      setError(msg)
      showToast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }

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
              {isSuccess
                ? "Sua senha foi redefinida com sucesso"
                : "Crie sua nova senha"}
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
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Sua senha foi redefinida com sucesso. Você será
                    redirecionado para a página de login em instantes.
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
                        className="pl-10 pr-10"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-gray-400 hover:text-gray-500"
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      Mínimo de 6 caracteres
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="password-confirm">
                      Confirmar nova senha
                    </Label>
                    <div className="mt-2 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <Input
                        id="password-confirm"
                        name="password-confirm"
                        type={showPassword ? "text" : "password"}
                        required
                        className="pl-10 pr-10"
                        placeholder="••••••••"
                        value={passwordConfirm}
                        onChange={(e) =>
                          setPasswordConfirm(e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <span className="flex items-center">
                          <span className="animate-spin mr-2">⏳</span>{" "}
                          Redefinindo senha...
                        </span>
                      ) : (
                        <span className="flex items-center">
                          Redefinir senha{" "}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </span>
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  )
}
