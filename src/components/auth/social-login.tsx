"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useSupabase } from "@/providers/SupabaseProvider"
import { showToast } from "@/components/ui/toast/toast-config"

export default function SocialLogin() {
  const { supabase } = useSupabase()
  const [isLoading, setIsLoading] = useState({
    google: false,
    facebook: false,
  })

  const handleGoogleLogin = async () => {
    setIsLoading(prev => ({ ...prev, google: true }))
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
      // Redirection handled by Supabase
    } catch (error: any) {
      console.error("Erro ao fazer login com Google:", error)
      showToast.error(error.message || "Erro ao fazer login com Google")
    } finally {
      setIsLoading(prev => ({ ...prev, google: false }))
    }
  }

  const handleFacebookLogin = async () => {
    setIsLoading(prev => ({ ...prev, facebook: true }))
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "facebook",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
      // Redirection handled by Supabase
    } catch (error: any) {
      console.error("Erro ao fazer login com Facebook:", error)
      showToast.error(error.message || "Erro ao fazer login com Facebook")
    } finally {
      setIsLoading(prev => ({ ...prev, facebook: false }))
    }
  }

  return (
    <div className="mt-6">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Ou continue com</span>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          type="button"
          disabled={isLoading.google}
          onClick={handleGoogleLogin}
          className="transition-all duration-300 hover:bg-blue-50"
        >
          <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
            <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
              <path
                fill="#4285F4"
                d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"
              />
              <path
                fill="#34A853"
                d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"
              />
              <path
                fill="#FBBC05"
                d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"
              />
              <path
                fill="#EA4335"
                d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"
              />
            </g>
          </svg>
          {isLoading.google ? "Processando..." : "Google"}
        </Button>

        <Button
          variant="outline"
          type="button"
          disabled={isLoading.facebook}
          onClick={handleFacebookLogin}
          className="transition-all duration-300 hover:bg-blue-50"
        >
          <svg className="h-5 w-5 mr-2" fill="#1877F2" viewBox="0 0 24 24">
            <path d="M9.19795 21.5H13.198V13.4901H16.8021L17.198 9.50977H13.198V7.5C13.198 6.94772 13.6457 6.5 14.198 6.5H17.198V2.5H14.198C11.4365 2.5 9.19795 4.73858 9.19795 7.5V9.50977H7.19795L6.80206 13.4901H9.19795V21.5Z" />
          </svg>
          {isLoading.facebook ? "Processando..." : "Facebook"}
        </Button>
      </div>
    </div>
  )
}
