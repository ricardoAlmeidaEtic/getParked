"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import MobileNav from "@/components/mobile-nav"
import { User } from "lucide-react"

interface NavbarProps {
  items?: {
    href: string
    label: string
  }[]
}

export default function Navbar({ items = [] }: NavbarProps) {
  const pathname = usePathname()
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem("user")
    setIsLoggedIn(!!userData)
  }, [pathname])

  const defaultItems = [
    { href: "#features", label: "Recursos" },
    { href: "#how-it-works", label: "Como Funciona" },
    { href: "#pricing", label: "Planos" },
    { href: "#faq", label: "FAQ" },
  ]

  const navItems = items.length > 0 ? items : defaultItems

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
          {isLoggedIn ? (
            <Button
              asChild
              variant="outline"
              className="bg-white text-primary-foreground border-none hover:bg-gray-100"
            >
              <Link href="/perfil" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Meu Perfil
              </Link>
            </Button>
          ) : (
            <>
              <Button
                asChild
                variant="outline"
                className="bg-white text-primary-foreground border-none hover:bg-gray-100"
              >
                <Link href="/auth/signin">Entrar</Link>
              </Button>
              <Button asChild className="bg-black text-white hover:bg-gray-800">
                <Link href="/auth/signup">Cadastre-se</Link>
              </Button>
            </>
          )}
        </div>
        <MobileNav items={navItems} />
      </div>
    </header>
  )
}