"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import MobileNav from "@/components/mobile-nav"
import { User, LogOut } from "lucide-react"
import { useSupabase } from "@/providers/SupabaseProvider"
import { useLogout } from "@/hooks/useLogout"

interface NavbarProps {
  items?: {
    href: string
    label: string
  }[]
}

export default function Navbar({ items = [] }: NavbarProps) {
  const pathname = usePathname()
  const { user, loading } = useSupabase()
  const { handleLogout } = useLogout()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const isAuthPage = pathname?.startsWith('/auth')
  const isMapPage = pathname?.startsWith('/map')
  const isProfilePage = pathname?.startsWith('/profile')

  // Itens de navegação para usuários autenticados
  const authenticatedItems = [
    { href: "/map", label: "Mapa" },
    { href: "/available-spots", label: "Vagas Disponíveis" },
    { href: "/reserved-spots", label: "Minhas Reservas" },
    { href: "/profile", label: "Perfil" },
  ]

  // Itens de navegação para usuários não autenticados
  const unauthenticatedItems = [
    { href: "#features", label: "Recursos" },
    { href: "#how-it-works", label: "Como Funciona" },
    { href: "#pricing", label: "Planos" },
    { href: "#faq", label: "FAQ" },
  ]

  const navItems = items.length > 0 ? items : (user ? authenticatedItems : unauthenticatedItems)

  const handleNavbarLogout = async () => {
    if (isLoggingOut) return
    setIsLoggingOut(true)
    await handleLogout()
  }

  // Renderiza null ou um placeholder enquanto carrega
  if (loading) {
    return (
      <header className="bg-primary py-4 px-6 sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="font-bold text-xl text-primary-foreground uppercase tracking-wider">
            GET<span className="font-black">PARKED</span>
          </Link>
          {/* Placeholder ou apenas o logo enquanto carrega */}
        </div>
      </header>
    )
  }

  return (
    <header className="bg-primary py-4 px-6 sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="font-bold text-xl text-primary-foreground uppercase tracking-wider">
          GET<span className="font-black">PARKED</span>
        </Link>
        <nav className="hidden md:flex space-x-8">
          {navItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className="text-primary-foreground hover:text-white font-medium transition-colors duration-200"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            <>
              <Link href="/profile">
                <Button
                  variant="outline"
                  className="bg-white text-primary-foreground border-none hover:bg-gray-100"
                >
                  <span className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Meu Perfil
                  </span>
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10"
                onClick={handleNavbarLogout}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? (
                  <span className="animate-spin">⏳</span>
                ) : (
                  <LogOut className="h-4 w-4" />
                )}
              </Button>
            </>
          ) : (
            <>
              <Link href="/auth/signin">
                <Button
                  variant="outline"
                  className="bg-white text-primary-foreground border-none hover:bg-gray-100"
                >
                  Entrar
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button className="bg-black text-white hover:bg-gray-800">
                  Cadastre-se
                </Button>
              </Link>
            </>
          )}
        </div>
        <MobileNav items={navItems} />
      </div>
    </header>
  )
}
