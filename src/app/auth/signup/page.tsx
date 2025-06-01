"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Mail, Lock, User, ArrowRight } from "lucide-react"
import { useSupabase } from "@/providers/SupabaseProvider"

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
import { showToast } from "@/lib/toast"

export default function SignUpPage() {
  const router = useRouter()
  const { supabase } = useSupabase()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Validação básica
      if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
        throw new Error('Por favor, preencha todos os campos')
      }

      if (formData.password !== formData.confirmPassword) {
        throw new Error('As senhas não coincidem')
      }

      if (formData.password.length < 6) {
        throw new Error('A senha deve ter pelo menos 6 caracteres')
      }

      // Cria o usuário
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name
          }
        }
      })

      if (signUpError) throw signUpError

      if (!data.user) {
        throw new Error('Erro ao criar usuário')
      }

      // Cria o perfil do usuário
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          role: 'client',
          full_name: formData.name,
          credits: 0,
          created_at: new Date().toISOString()
        })

      if (profileError) {
        console.error('Erro ao criar perfil:', profileError)
        showToast.success('Email de confirmação enviado com sucesso')
        return
      }

      showToast.success('Conta criada com sucesso! Por favor, verifique seu email.')
      router.push('/auth/signin')
    } catch (error) {
      console.error('Erro no cadastro:', error)
      setError(error instanceof Error ? error.message : 'Erro ao criar conta')
      showToast.error(error instanceof Error ? error.message : 'Erro ao criar conta')
    } finally {
      setLoading(false)
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
                      className="pl-10"
                      placeholder="Seu nome completo"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
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
                      className="pl-10"
                      placeholder="seu@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
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
                      type="password"
                      autoComplete="new-password"
                      required
                      className="pl-10 pr-10"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    />
                  </div>
                  <p className="mt-1 text-sm text-gray-500">Mínimo de 6 caracteres</p>
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                  <div className="mt-2 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      required
                      className="pl-10 pr-10"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? (
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
