"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import MobileNav from "@/components/mobile-nav"
import { User, LogOut, Loader2 } from "lucide-react"
import { useSupabase } from "@/providers/SupabaseProvider"
import { useLogout } from "@/hooks/useLogout"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface NavItem {
  href: string
  label: string
  icon?: string
}

interface NavbarProps {
  items?: NavItem[]
}

export default function Navbar({ items = [] }: NavbarProps) {
  const pathname = usePathname()
  const { user, loading } = useSupabase()
  const { handleLogout } = useLogout()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const isAuthPage = pathname?.startsWith('/auth')
  const isMapPage = pathname?.startsWith('/map')
  const isProfilePage = pathname?.startsWith('/profile')
  const isAdminRoute = pathname?.startsWith('/admin')

  // Don't render navbar on admin routes
  if (isAdminRoute) {
    return null;
  }

  // Itens de navegação para usuários autenticados
  const authenticatedItems: NavItem[] = [
    { href: "/map", label: "Mapa", icon: "/icons/navbar/map.svg" },
    { href: "/planos", label: "Planos", icon: "/icons/navbar/plans.svg" },
    { href: "/reserved-spots", label: "Minhas Reservas", icon: "/icons/navbar/reservations.svg" },
  ]

  // Itens de navegação para usuários não autenticados
  const unauthenticatedItems: NavItem[] = [
    { href: "#features", label: "Funcionalidades", icon: "/icons/navbar/features.svg" },
    { href: "#how-it-works", label: "Como Funciona", icon: "/icons/navbar/how-it-works.svg" },
    { href: "#pricing", label: "Planos", icon: "/icons/navbar/plans.svg" },
    { href: "#faq", label: "FAQ", icon: "/icons/navbar/faq.svg" },
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
      <header className="bg-primary py-3 px-4 sm:py-4 sm:px-6 sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="font-bold text-lg sm:text-xl text-primary-foreground uppercase tracking-wider">
            GET<span className="font-black">PARKED</span>
          </Link>
        </div>
      </header>
    )
  }

  return (
    <header className="bg-primary py-3 px-4 sm:py-4 sm:px-6 sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="font-bold text-lg sm:text-xl text-primary-foreground uppercase tracking-wider hover:opacity-90 transition-opacity">
          GET<span className="font-black">PARKED</span>
        </Link>
        <nav className="hidden lg:flex space-x-6 xl:space-x-8">
          {navItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className={cn(
                "text-primary-foreground hover:text-white font-medium transition-all duration-200 flex items-center gap-2 px-3 py-2 rounded-md text-sm xl:text-base",
                pathname === item.href && "bg-white/10 text-white"
              )}
            >
              {item.icon && (
                <Image
                  src={item.icon}
                  alt={item.label}
                  width={20}
                  height={20}
                  className={cn(
                    "transition-colors duration-200",
                    pathname === item.href ? "text-white" : "text-primary-foreground"
                  )}
                />
              )}
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden lg:flex items-center space-x-3 xl:space-x-4">
          {user ? (
            <>
              <Link href="/profile">
                <Button
                  variant="outline"
                  className={cn(
                    "bg-white text-primary-foreground border-none hover:bg-gray-100 transition-all duration-200 text-sm xl:text-base",
                    pathname === "/profile" && "ring-2 ring-white"
                  )}
                >
                  <span className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    O Meu Perfil
                  </span>
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-none flex items-center gap-2 px-3 xl:px-4 transition-all duration-200 text-sm xl:text-base"
                onClick={handleNavbarLogout}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <LogOut className="h-4 w-4" />
                    <span>Sair</span>
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <Link href="/auth/signin">
                <Button
                  variant="outline"
                  className="bg-white text-primary-foreground border-none hover:bg-gray-100 transition-all duration-200 text-sm xl:text-base"
                >
                  Iniciar sessão
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button className="bg-black text-white hover:bg-gray-800 transition-all duration-200 text-sm xl:text-base">
                  Registar-se
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
