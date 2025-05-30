"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import FadeIn from "@/components/animations/fade-in"
import AuthHeader from "@/components/auth/auth-header"
import AuthTerms from "@/components/auth/auth-terms"
import { showToast } from "@/components/ui/toast"
import { useSupabase } from "@/providers/SupabaseProvider"
//import { SocialLogin } from "@/components/auth"

export default function SignInPage() {
  const router = useRouter()
  const { supabase } = useSupabase()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showEmailConfirmMessage, setShowEmailConfirmMessage] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  })

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get("message") === "confirm-email") {
      setShowEmailConfirmMessage(true)
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, rememberMe: checked }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      if (!formData.email.includes("@")) {
        throw new Error("Email inválido")
      }

      if (formData.password.length < 6) {
        throw new Error("Senha deve ter pelo menos 6 caracteres")
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (error) {
        if (error.message === "Email not confirmed") {
          throw new Error("Email não confirmado. Verifique sua caixa de entrada e clique no link de confirmação antes de fazer login.")
        }
        throw error
      }

      showToast.success("Login realizado com sucesso!")
      router.push("/dashboard")
    } catch (err: any) {
      const errorMessage = err.message || "Ocorreu um erro ao fazer login"
      setError(errorMessage)
      showToast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex min-h-screen flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <AuthHeader
          title="Entre na sua conta"
          subtitle="Ou"
          subtitleLink={{
            text: "Ou",
            href: "/auth/signup",
            label: "crie uma nova conta",
          }}
        />

        <FadeIn direction="up" duration={800} delay={200}>
          <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white px-6 py-8 shadow sm:rounded-lg sm:px-12">
              {showEmailConfirmMessage && (
                <Alert className="mb-6 border-blue-200 bg-blue-50">
                  <AlertDescription className="text-blue-800">
                    📧 Conta criada com sucesso! Verifique seu email e clique no link de confirmação antes de fazer login.
                  </AlertDescription>
                </Alert>
              )}

              {error && (
                <Alert variant="destructive" className="mb-6 animate-shake">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <div className="mt-2 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      className="pl-10 transition-all duration-300 focus:border-primary focus:ring-primary"
                      placeholder="seu@email.com"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Senha</Label>
                    <Link
                      href="/auth/forgot-password"
                      className="text-sm font-medium text-primary hover:text-primary-hover transition-colors duration-300"
                    >
                      Esqueceu a senha?
                    </Link>
                  </div>
                  <div className="mt-2 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      className="pl-10 pr-10 transition-all duration-300 focus:border-primary focus:ring-primary"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
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
                </div>

                <div className="flex items-center">
                  <Checkbox
                    id="remember-me"
                    checked={formData.rememberMe}
                    onCheckedChange={handleCheckboxChange}
                    className="transition-colors duration-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <Label htmlFor="remember-me" className="ml-2 text-sm text-gray-900">
                    Lembrar de mim
                  </Label>
                </div>

                <Button
                  type="submit"
                  className="w-full transition-all duration-300 hover:bg-primary-hover transform hover:scale-[1.02]"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <span className="animate-spin mr-2">⏳</span> Entrando...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      Entrar <ArrowRight className="ml-2 h-4 w-4" />
                    </span>
                  )}
                </Button>
              </form>

              {/* <SocialLogin /> */}
            </div>

            <AuthTerms />
          </div>
        </FadeIn>
      </div>
    </div>
  )
}
