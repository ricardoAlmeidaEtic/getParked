"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useSupabase } from "@/providers/SupabaseProvider"
import { showToast } from "@/components/ui/toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { User, LogOut } from "lucide-react"

export default function TestAuthPage() {
  const router = useRouter()
  const { supabase, user, loading } = useSupabase()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [userDetails, setUserDetails] = useState<any>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }
  
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (user) {
        try {
          // Buscar perfil do usuário
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()
            
          if (error) {
            console.error("Erro ao buscar perfil:", error)
            return
          }
          
          setUserDetails(profile)
        } catch (err) {
          console.error("Erro ao buscar detalhes do usuário:", err)
        }
      }
    }
    
    if (!loading) {
      fetchUserDetails()
    }
  }, [user, loading, supabase])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })
      
      if (error) throw error
      
      showToast.success("Login realizado com sucesso!")
      router.push("/profile")
    } catch (error: any) {
      console.error("Erro ao fazer login:", error)
      showToast.error(error.message || "Erro ao fazer login")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.email.split('@')[0]
          }
        }
      })
      
      if (error) throw error
      
      // Criar o perfil do usuário
      if (data?.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            name: formData.email.split('@')[0],
            email: formData.email,
            plan: 'Gratuito',
            created_at: new Date().toISOString()
          })
        
        if (profileError) console.error("Erro ao criar perfil:", profileError)
      }
      
      showToast.success("Conta criada com sucesso! Faça login para continuar.")
    } catch (error: any) {
      console.error("Erro ao criar conta:", error)
      showToast.error(error.message || "Erro ao criar conta")
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleLogout = async () => {
    try {
      setIsLoading(true)
      const { error } = await supabase.auth.signOut()
      
      if (error) throw error
      
      showToast.success("Logout realizado com sucesso!")
      setUserDetails(null)
    } catch (error: any) {
      console.error("Erro ao fazer logout:", error)
      showToast.error(error.message || "Erro ao fazer logout")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Teste de Autenticação</CardTitle>
          <CardDescription className="text-center">
            {loading ? "Verificando autenticação..." : 
             user ? `Autenticado como ${user.email}` : 
             "Faça login ou crie uma conta para testar"}
          </CardDescription>
        </CardHeader>
        
        {!user ? (
          <>
            <CardContent>
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button onClick={handleSignUp} variant="outline" disabled={isLoading}>
                {isLoading ? "Processando..." : "Criar Conta"}
              </Button>
              <Button onClick={handleLogin} disabled={isLoading}>
                {isLoading ? "Processando..." : "Login"}
              </Button>
            </CardFooter>
          </>
        ) : (
          <>
            <CardContent>
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user.user_metadata?.avatar_url || ""} />
                  <AvatarFallback>
                    <User className="h-10 w-10" />
                  </AvatarFallback>
                </Avatar>
                
                <div className="space-y-1 text-center">
                  <h3 className="text-xl font-medium">{userDetails?.name || user.user_metadata?.name || user.email?.split('@')[0]}</h3>
                  <p className="text-sm text-gray-500">{user.email}</p>
                  {userDetails && (
                    <div className="mt-2">
                      <p className="text-sm">Plano: {userDetails.plan || "Gratuito"}</p>
                      <p className="text-sm">Desde: {new Date(userDetails.created_at || user.created_at).toLocaleDateString('pt-BR')}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <Button variant="default" className="w-full" asChild>
                <Link href="/profile">
                  Ir para Página de Perfil
                </Link>
              </Button>
              <Button variant="outline" className="w-full" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </Button>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  )
}
