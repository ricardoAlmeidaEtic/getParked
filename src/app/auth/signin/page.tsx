"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Mail, Lock } from "lucide-react"
import { useSupabase } from "@/providers/SupabaseProvider"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "@/components/ui/card"
import FadeIn from "@/components/animations/fade-in"
import AuthHeader from "@/components/auth/auth-header"
import SocialLogin from "@/components/auth/social-login"
import Link from "next/link"
import { showToast } from "@/lib/toast"
import { Checkbox } from "@/components/ui/checkbox"

export default function SignInPage() {
  const router = useRouter()
  const { supabase } = useSupabase()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (signInError) throw signInError

      if (!data.user) {
        throw new Error('Usuário não encontrado')
      }

      // Check user role BEFORE showing success
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()

      if (profileError) {
        console.error('Erro ao verificar perfil:', profileError)
        await supabase.auth.signOut()
        throw new Error('Erro ao verificar permissões')
      }

      if (!profile || profile.role !== 'client') {
        console.log('User does not have client role:', profile?.role)
        await supabase.auth.signOut()
        throw new Error('Acesso restrito a clientes. Use /admin/login para administradores.')
      }

      // Only show success if role check passes
      showToast.success('Login realizado com sucesso!')
      router.push('/map')
    } catch (error) {
      console.error('Erro no login:', error)
      setError(error instanceof Error ? error.message : 'Erro ao fazer login')
      showToast.error(error instanceof Error ? error.message : 'Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, rememberMe: checked }))
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex min-h-screen flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <AuthHeader
          title="Entre na sua conta"
          subtitle="Não tem uma conta?"
          subtitleLink={{
            text: "Não tem uma conta?",
            href: "/auth/signup",
            label: "Cadastre-se",
          }}
        />

        <FadeIn direction="up" duration={800} delay={200}>
          <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
            <Card>
              <CardContent className="p-6">
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
                        className="pl-10"
                        placeholder="seu@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Senha</Label>
                      <div className="text-sm">
                        <Link
                          href="/auth/forgot-password"
                          className="font-semibold text-primary hover:text-primary/80"
                        >
                          Esqueceu a senha?
                        </Link>
                      </div>
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
                        className="pl-10 pr-10"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
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

                  <div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={loading}
                    >
                      {loading ? (
                        <span className="flex items-center">
                          <span className="animate-spin mr-2">⏳</span> Entrando...
                        </span>
                      ) : (
                        "Entrar"
                      )}
                    </Button>
                  </div>
                </form>

                {/* <SocialLogin /> */}
              </CardContent>
            </Card>
          </div>
        </FadeIn>
      </div>
    </div>
  )
}
