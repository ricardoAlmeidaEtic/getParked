"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Mail, Lock, User, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import FadeIn from "@/components/animations/fade-in"
import AuthHeader from "@/components/auth/auth-header"
import SocialLogin from "@/components/auth/social-login"
import AuthTerms from "@/components/auth/auth-terms"
import Link from "next/link"
import { showToast } from "@/components/ui/toast/toast-config"
import { useSupabase } from "@/providers/SupabaseProvider"

export default function SignUpPage() {
  const router = useRouter()
  const { supabase } = useSupabase()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    agreeTerms: false,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, agreeTerms: checked }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validate form
    if (!formData.agreeTerms) {
      setError("Você precisa concordar com os termos para continuar")
      showToast.warning("Você precisa concordar com os termos para continuar")
      return
    }

    setIsLoading(true)

    try {
      // Register with Supabase auth
      const { data, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name
          }
        }
      })
      
      if (authError) throw authError;

      // Show success toast
      showToast.success("Conta criada com sucesso! Por favor, verifique seu email para confirmar seu cadastro.")

      // Redirect to home page on successful registration
      router.push("/")
    } catch (error: any) {
      setError(error.message || "Ocorreu um erro ao criar sua conta")
      showToast.error(error.message || "Ocorreu um erro ao criar sua conta")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex min-h-screen flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <AuthHeader
          title="Crie sua conta"
          subtitle="Já tem uma conta?"
          subtitleLink={{
            text: "Já tem uma conta?",
            href: "/auth/signin",
            label: "Faça login",
          }}
        />

        <FadeIn direction="up" duration={800} delay={200}>
          <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white px-6 py-8 shadow sm:rounded-lg sm:px-12">
              {error && (
                <Alert variant="destructive" className="mb-6 animate-shake">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <Label htmlFor="name">Nome completo</Label>
                  <div className="mt-2 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      required
                      className="pl-10 transition-all duration-300 focus:border-primary focus:ring-primary"
                      placeholder="Seu nome completo"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>
                </div>

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
                  <Label htmlFor="password">Senha</Label>
                  <div className="mt-2 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
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
                  <p className="mt-1 text-sm text-gray-500">Mínimo de 6 caracteres</p>
                </div>

                <div className="flex items-center">
                  <Checkbox
                    id="agree-terms"
                    checked={formData.agreeTerms}
                    onCheckedChange={handleCheckboxChange}
                    required
                    className="transition-colors duration-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <Label htmlFor="agree-terms" className="ml-2 text-sm text-gray-900">
                    Eu concordo com os{" "}
                    <Link
                      href="#"
                      className="font-medium text-primary hover:text-primary-hover transition-colors duration-300"
                    >
                      Termos de Serviço
                    </Link>{" "}
                    e{" "}
                    <Link
                      href="#"
                      className="font-medium text-primary hover:text-primary-hover transition-colors duration-300"
                    >
                      Política de Privacidade
                    </Link>
                  </Label>
                </div>

                <div>
                  <Button
                    type="submit"
                    className="w-full transition-all duration-300 hover:bg-primary-hover transform hover:scale-[1.02]"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center">
                        <span className="animate-spin mr-2">⏳</span> Criando conta...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        Criar conta <ArrowRight className="ml-2 h-4 w-4" />
                      </span>
                    )}
                  </Button>
                </div>
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
