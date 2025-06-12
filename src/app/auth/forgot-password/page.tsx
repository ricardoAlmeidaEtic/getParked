"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Mail } from "lucide-react"
import { useSupabase } from "@/providers/SupabaseProvider"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "@/components/ui/card"
import FadeIn from "@/components/animations/fade-in"
import AuthHeader from "@/components/auth/auth-header"
import { showToast } from "@/lib/toast"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const { supabase } = useSupabase()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [email, setEmail] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (resetError) throw resetError

      setSuccess(true)
      showToast.success('Email de recuperação enviado com sucesso!')
    } catch (error) {
      console.error('Erro ao enviar email de recuperação:', error)
      setError(error instanceof Error ? error.message : 'Erro ao enviar email de recuperação')
      showToast.error(error instanceof Error ? error.message : 'Erro ao enviar email de recuperação')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex min-h-screen flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <AuthHeader
          title="Esqueceu-se da sua palavra-passe?"
          subtitle="Lembrou-se da sua palavra-passe?"
          subtitleLink={{
            text: "Lembrou-se da sua palavra-passe?",
            href: "/auth/signin",
            label: "Voltar ao início de sessão",
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

                {success ? (
                  <Alert className="mb-6 border-green-200 bg-green-50">
                    <AlertDescription className="text-green-800">
                      ✉️ Email de recuperação enviado! Verifique a sua caixa de entrada e siga as instruções para redefinir a sua palavra-passe.
                    </AlertDescription>
                  </Alert>
                ) : (
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
                          placeholder="o.seu@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
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
                            <span className="animate-spin mr-2">⏳</span> A enviar...
                          </span>
                        ) : (
                          "Enviar email de recuperação"
                        )}
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </FadeIn>
      </div>
    </div>
  )
}
