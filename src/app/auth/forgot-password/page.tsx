"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Mail, ArrowRight, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import FadeIn from "@/components/animations/fade-in"
import { showToast } from "@/components/ui/toast/toast-config"
import { useSupabase } from "@/providers/SupabaseProvider"

export default function ForgotPasswordPage() {
  const { supabase } = useSupabase()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [email, setEmail] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      })

      if (error) throw error

      setIsSubmitted(true)
      showToast.success("Email de recuperação enviado!")
    } catch (error: any) {
      console.error('Forgot password error:', error) // Debug log
      setError(error.message || "Erro ao enviar email de recuperação")
      showToast.error(error.message || "Erro ao enviar email de recuperação")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex min-h-screen flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <FadeIn direction="down" duration={800}>
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <Link href="/landing" className="flex justify-center transition-transform duration-300 hover:scale-105">
              <span className="font-bold text-2xl text-primary uppercase tracking-wider">
                GET<span className="font-black">PARKED</span>
              </span>
            </Link>
            <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight">
              {isSubmitted ? "Verifique seu email" : "Recuperar senha"}
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              {isSubmitted ? (
                "Enviamos instruções para recuperar sua senha"
              ) : (
                <>Enviaremos um link para redefinir sua senha</>
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

              {isSubmitted ? (
                <div className="space-y-6">
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
                      Enviamos um email para <strong>{email}</strong> com instruções para recuperar sua senha.
                    </p>
                    <p className="text-sm text-gray-600">
                      Não recebeu o email? Verifique sua pasta de spam ou{" "}
                      <button
                        type="button"
                        onClick={() => setIsSubmitted(false)}
                        className="text-primary hover:text-primary-hover transition-colors duration-300"
                      >
                        tente novamente
                      </button>
                      .
                    </p>
                  </div>

                  <div>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full transition-all duration-300 hover:bg-gray-50 transform hover:scale-[1.02]"
                      onClick={() => (window.location.href = "/auth/signin")}
                    >
                      <span className="flex items-center">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para o login
                      </span>
                    </Button>
                  </div>
                </div>
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
                        className="pl-10 transition-all duration-300 focus:border-primary focus:ring-primary"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
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
                          <span className="animate-spin mr-2">⏳</span> Enviando...
                        </span>
                      ) : (
                        <span className="flex items-center">
                          Enviar instruções <ArrowRight className="ml-2 h-4 w-4" />
                        </span>
                      )}
                    </Button>
                  </div>

                  <div className="text-center">
                    <Link
                      href="/auth/signin"
                      className="text-sm font-medium text-primary hover:text-primary-hover transition-colors duration-300"
                    >
                      Voltar para o login
                    </Link>
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
